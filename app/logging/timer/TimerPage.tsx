'use client'
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react'
import DaySection from './DaySection'
import MonthSection from './MonthSection'
import { useTimelineGrouping } from './useTimelineGrouping'
import { useTimeblocks } from '../hooks/useTimeblocks'
import { useTagInstances } from '../hooks/useTagInstances'
import { FocusedNotesProvider, useFocusedNotes } from '../context/FocusedNotesContext'
import { TagsProvider } from '../tags/TagsContext'
import NotesInput from '../editor/NotesInput'
import type { Timeblock } from '../types'
import Checklist, { type ChecklistRef } from '../checklist/Checklist'
import Timer from './Timer'
import RunAiCommandPanel from './RunAiCommandPanel'
import { useAiTags } from '../hooks/useAiTags'
import { useTags } from '../tags/TagsContext'
import { EMPTY_TIMEBLOCKS, EMPTY_TAG_INSTANCES } from './constants'
import { dayKey } from '../lib/timeUtils'

const TimerPageInner = () => {
  const { isPredicting, predictTags } = useAiTags()
  const { isLoading: isLoadingTags } = useTags()
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({})
  const [collapsedWeeks, setCollapsedWeeks] = useState<Record<string, boolean>>({})
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({})
  const checklistRef = useRef<ChecklistRef>(null)
  const handleTimerComplete = useCallback(() => {
    checklistRef.current?.resetAllItems()
  }, [])
  const { focusedNoteKeysRef } = useFocusedNotes()

  const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  const startDate = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()
  const { timeblocks, isLoading: isLoadingTimeblocks, createTimeblock, patchTimeblockDebounced, refreshUnfocused, load: loadTimeblocks } = useTimeblocks({ start: startIso, end: endIso })
  const { tagInstances, loadRange: loadTagInstancesRange, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance } = useTagInstances({ start: startIso, end: endIso, autoLoad: false })
  const [isLoadingVisibleTagInstances, setIsLoadingVisibleTagInstances] = useState(true)
  const handleRunAiCommand = useCallback(async (datetime: string) => {
    const result = await predictTags({ datetime })
    if (result?.createdInstances && result.createdInstances.length > 0) loadTagInstancesRange({ start: startIso, end: endIso })
    if (result?.aiNotes !== undefined) loadTimeblocks()
  }, [predictTags, loadTagInstancesRange, loadTimeblocks, startIso, endIso])

  // Stable callback identities so memoized day/week/month sections don't re-render every poll cycle
  const callbacksRef = useRef({ createTimeblock, patchTimeblockDebounced, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance })
  useLayoutEffect(() => {
    callbacksRef.current = { createTimeblock, patchTimeblockDebounced, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance }
  })
  const onCreateTimeblock = useCallback(async (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => {
    const tb = await callbacksRef.current.createTimeblock(args)
    return tb as Timeblock
  }, [])
  const onPatchTimeblockDebounced = useCallback((args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, debounceMs?: number }) => callbacksRef.current.patchTimeblockDebounced(args), [])
  const onCreateTagInstance = useCallback((args: { tagId: number, datetime: string, approved?: boolean }) => callbacksRef.current.createTagInstance(args), [])
  const onApproveTagInstance = useCallback((args: { id: number }) => callbacksRef.current.approveTagInstance(args), [])
  const onPatchTagInstance = useCallback((args: { id: number, useful?: boolean, antiUseful?: boolean }) => callbacksRef.current.patchTagInstance(args), [])
  const onDeleteTagInstance = useCallback((args: { id: number }) => callbacksRef.current.deleteTagInstance(args), [])
  const onToggleDayCollapsed = useCallback((key: string) => {
    const todayKey = dayKey(new Date())
    setCollapsedDays(prev => ({ ...prev, [key]: !(prev[key] ?? !(key === todayKey)) }))
  }, [])
  const onToggleWeekCollapsed = useCallback((key: string) => {
    setCollapsedWeeks(prev => ({ ...prev, [key]: !(prev[key] ?? (key !== newestKeysRef.current.week)) }))
  }, [])
  const onToggleMonthCollapsed = useCallback((key: string) => {
    setCollapsedMonths(prev => ({ ...prev, [key]: !(prev[key] ?? (key !== newestKeysRef.current.month)) }))
  }, [])

  const { timeblocksByDay, tagInstancesByDay, groupedDays, newestKeys } = useTimelineGrouping(timeblocks, tagInstances)
  const newestKeysRef = useRef(newestKeys)
  useLayoutEffect(() => { newestKeysRef.current = newestKeys }, [newestKeys])

  const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  const currentBlockDatetime = floorTo15(new Date()).toISOString()
  const currentTimeblock = timeblocks.find(tb => new Date(tb.datetime).toISOString() === currentBlockDatetime)
  const ensureCurrentTimeblock = async () => {
    if (currentTimeblock) return currentTimeblock
    const created = await createTimeblock({ datetime: currentBlockDatetime, rayNotes: null, assistantNotes: null, aiNotes: null })
    return created as Timeblock
  }

  useEffect(() => {
    loadTagInstancesRange({ start: startIso, end: endIso }).then(() => setIsLoadingVisibleTagInstances(false))
  }, [loadTagInstancesRange, startIso, endIso])

  // Poll the visible window every 5 seconds. Older tag instances are immutable.
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnfocused(focusedNoteKeysRef.current)
      loadTagInstancesRange({ start: startIso, end: endIso })
      checklistRef.current?.refreshItems()
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeysRef, loadTagInstancesRange, startIso, endIso])

  return (
    <div className="p-4 text-sm">
      <div className="mb-4">
        <Timer
          onTimerComplete={handleTimerComplete}
          onRunAiCommand={handleRunAiCommand}
          checklistRef={checklistRef}
          isPredicting={isPredicting}
        />
        <div className="flex items-center gap-2 mb-2">
          <RunAiCommandPanel datetime={currentBlockDatetime} onComplete={() => { loadTagInstancesRange({ start: startIso, end: endIso }); loadTimeblocks() }} />
        </div>
        <NotesInput
          noteKey={currentTimeblock ? `${currentTimeblock.id}:aiNotes` : undefined}
          placeholder="AI Notes"
          initialValue={currentTimeblock?.aiNotes || ''}
          externalValue={currentTimeblock?.aiNotes || ''}
          onSave={async (content) => {
            const tb = await ensureCurrentTimeblock()
            patchTimeblockDebounced({ id: tb.id, aiNotes: content, debounceMs: 0 })
          }}
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          {groupedDays.currentWeekDays.map(day => {
            const key = dayKey(day)
            const isToday = day.getTime() === groupedDays.today.getTime()
            const isCollapsed = collapsedDays[key] ?? !isToday
            return (
              <DaySection
                key={key}
                dayKey={key}
                day={day}
                isCollapsed={isCollapsed}
                onToggleCollapsed={onToggleDayCollapsed}
                dayTimeblocks={timeblocksByDay.get(key) || EMPTY_TIMEBLOCKS}
                dayTagInstances={tagInstancesByDay.get(key) || EMPTY_TAG_INSTANCES}
                allTagInstances={tagInstances}
                onCreateTimeblock={onCreateTimeblock}
                onPatchTimeblockDebounced={onPatchTimeblockDebounced}
                onCreateTagInstance={onCreateTagInstance}
                onApproveTagInstance={onApproveTagInstance}
                onPatchTagInstance={onPatchTagInstance}
                onDeleteTagInstance={onDeleteTagInstance}
              />
            )
          })}
          {groupedDays.previousMonths.map(({ month, weeks }, monthIdx) => {
            const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
            const isMonthCollapsed = collapsedMonths[monthKey] ?? (monthIdx > 0)
            return (
              <MonthSection
                key={monthKey}
                monthKey={monthKey}
                month={month}
                weeks={weeks}
                isCollapsed={isMonthCollapsed}
                isNewestMonth={monthIdx === 0}
                onToggleCollapsed={onToggleMonthCollapsed}
                collapsedWeeks={collapsedWeeks}
                onToggleWeekCollapsed={onToggleWeekCollapsed}
                collapsedDays={collapsedDays}
                onToggleDayCollapsed={onToggleDayCollapsed}
                timeblocksByDay={timeblocksByDay}
                tagInstancesByDay={tagInstancesByDay}
                allTagInstances={tagInstances}
                onCreateTimeblock={onCreateTimeblock}
                onPatchTimeblockDebounced={onPatchTimeblockDebounced}
                onCreateTagInstance={onCreateTagInstance}
                onApproveTagInstance={onApproveTagInstance}
                onPatchTagInstance={onPatchTagInstance}
                onDeleteTagInstance={onDeleteTagInstance}
              />
            )
          })}
        </div>
        <div className={`w-fit self-start sticky top-14 mt-10`}>
          <Checklist ref={checklistRef} />
        </div>
      </div>
      {(isLoadingTimeblocks || isLoadingVisibleTagInstances || isLoadingTags) && (
        <div className="flex items-center gap-2 py-4 text-gray-500">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading...
        </div>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const TimerPage = ({}:{}) => (
  <FocusedNotesProvider>
    <TagsProvider>
      <TimerPageInner />
    </TagsProvider>
  </FocusedNotesProvider>
)

export default TimerPage

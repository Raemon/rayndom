'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import DaySection from './DaySection'
import MonthSection from './MonthSection'
import TagSidebar from '../tags/TagSidebar'
import { useTimeblocks } from '../hooks/useTimeblocks'
import { useTagInstances } from '../hooks/useTagInstances'
import { FocusedNotesProvider, useFocusedNotes } from '../context/FocusedNotesContext'
import { TagsProvider } from '../tags/TagsContext'
import NotesInput from '../editor/NotesInput'
import type { Timeblock } from '../types'
import Checklist, { type ChecklistRef } from '../checklist/Checklist'
import Timer from './Timer'
import { getCurrentSection } from '../checklist/sectionUtils'
import RunAiCommandButton from '../zen/RunAiCommandButton'
import { useAiTags } from '../hooks/useAiTags'

const TimerPageInner = () => {
  const { isPredicting, predictTags } = useAiTags()
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({})
  const [collapsedWeeks, setCollapsedWeeks] = useState<Record<string, boolean>>({})
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({})
  const checklistRef = useRef<ChecklistRef>(null)
  const handleTimerComplete = useCallback(() => {
    checklistRef.current?.resetAllItems()
  }, [])
  const { focusedNoteKeys } = useFocusedNotes()

  const [currentSection, setCurrentSection] = useState(getCurrentSection())
  useEffect(() => {
    const interval = setInterval(() => setCurrentSection(getCurrentSection()), 30000)
    return () => clearInterval(interval)
  }, [])

  const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  const startDate = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()
  const { timeblocks, createTimeblock, patchTimeblockDebounced, refreshUnfocused, load: loadTimeblocks } = useTimeblocks({ start: startIso, end: endIso })
  const { tagInstances, load: loadTagInstances, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance } = useTagInstances({ start: startIso, end: endIso })
  const handleRunAiCommand = useCallback(async (datetime: string) => {
    const result = await predictTags({ datetime })
    if (result?.createdInstances && result.createdInstances.length > 0) loadTagInstances()
    if (result?.aiNotes !== undefined) loadTimeblocks()
  }, [predictTags, loadTagInstances, loadTimeblocks])

  const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  const currentBlockDatetime = floorTo15(new Date()).toISOString()
  const currentTimeblock = timeblocks.find(tb => new Date(tb.datetime).toISOString() === currentBlockDatetime)
  const ensureCurrentTimeblock = async () => {
    if (currentTimeblock) return currentTimeblock
    const created = await createTimeblock({ datetime: currentBlockDatetime, rayNotes: null, assistantNotes: null, aiNotes: null })
    return created as Timeblock
  }

  // Poll database every 5 seconds to refresh unfocused notes, tag instances, and checklist
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnfocused(focusedNoteKeys)
      loadTagInstances()
      checklistRef.current?.refreshItems()
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeys, loadTagInstances])

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
          <RunAiCommandButton datetime={currentBlockDatetime} onComplete={() => { loadTagInstances(); loadTimeblocks() }} />
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
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {(() => {
            const getMonday = (date: Date) => {
              const d = new Date(date)
              const dow = d.getDay()
              d.setDate(d.getDate() - dow + (dow === 0 ? -6 : 1))
              d.setHours(0, 0, 0, 0)
              return d
            }
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const currentMonday = getMonday(today)
            const allDays: Date[] = []
            for (let i = 0; i < 14; i++) {
              const day = new Date()
              day.setDate(day.getDate() - i)
              day.setHours(0, 0, 0, 0)
              allDays.push(day)
            }
            const currentWeekDays = allDays.filter(d => d >= currentMonday)
            const previousDays = allDays.filter(d => d < currentMonday)
            const weekGroupsMap = new Map<string, { monday: Date, days: Date[] }>()
            for (const day of previousDays) {
              const mon = getMonday(day)
              const key = mon.toISOString().slice(0, 10)
              if (!weekGroupsMap.has(key)) weekGroupsMap.set(key, { monday: mon, days: [] })
              weekGroupsMap.get(key)!.days.push(day)
            }
            const previousWeeks = [...weekGroupsMap.values()].sort((a, b) => b.monday.getTime() - a.monday.getTime())
            const monthGroupsMap = new Map<string, { month: Date, weeks: { monday: Date, days: Date[] }[] }>()
            for (const week of previousWeeks) {
              const monthKey = `${week.monday.getFullYear()}-${String(week.monday.getMonth() + 1).padStart(2, '0')}`
              if (!monthGroupsMap.has(monthKey)) monthGroupsMap.set(monthKey, { month: new Date(week.monday.getFullYear(), week.monday.getMonth(), 1), weeks: [] })
              monthGroupsMap.get(monthKey)!.weeks.push(week)
            }
            const previousMonths = [...monthGroupsMap.values()].sort((a, b) => b.month.getTime() - a.month.getTime())
            return (
              <>
                {currentWeekDays.map(day => {
                  const key = day.toISOString().slice(0, 10)
                  const isToday = day.getTime() === today.getTime()
                  const isCollapsed = collapsedDays[key] ?? !isToday
                  return (
                    <DaySection
                      key={key}
                      day={day}
                      isCollapsed={isCollapsed}
                      onToggleCollapsed={() => setCollapsedDays(prev => ({ ...prev, [key]: !(prev[key] ?? !isToday) }))}
                      timeblocks={timeblocks}
                      tagInstances={tagInstances}
                      onCreateTimeblock={async (args) => {
                        const tb = await createTimeblock(args)
                        return tb as Timeblock
                      }}
                      onPatchTimeblockDebounced={patchTimeblockDebounced}
                      onCreateTagInstance={createTagInstance}
                      onApproveTagInstance={approveTagInstance}
                      onPatchTagInstance={patchTagInstance}
                      onDeleteTagInstance={deleteTagInstance}
                    />
                  )
                })}
                {previousMonths.map(({ month, weeks }) => {
                  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
                  const isMonthCollapsed = collapsedMonths[monthKey] ?? true
                  return (
                    <MonthSection
                      key={monthKey}
                      month={month}
                      weeks={weeks}
                      isCollapsed={isMonthCollapsed}
                      onToggleCollapsed={() => setCollapsedMonths(prev => ({ ...prev, [monthKey]: !(prev[monthKey] ?? true) }))}
                      collapsedWeeks={collapsedWeeks}
                      onToggleWeekCollapsed={(weekKey) => setCollapsedWeeks(prev => ({ ...prev, [weekKey]: !(prev[weekKey] ?? true) }))}
                      collapsedDays={collapsedDays}
                      onToggleDayCollapsed={(dayKey) => setCollapsedDays(prev => ({ ...prev, [dayKey]: !(prev[dayKey] ?? true) }))}
                      timeblocks={timeblocks}
                      tagInstances={tagInstances}
                      onCreateTimeblock={async (args) => {
                        const tb = await createTimeblock(args)
                        return tb as Timeblock
                      }}
                      onPatchTimeblockDebounced={patchTimeblockDebounced}
                      onCreateTagInstance={createTagInstance}
                      onApproveTagInstance={approveTagInstance}
                      onPatchTagInstance={patchTagInstance}
                      onDeleteTagInstance={deleteTagInstance}
                    />
                  )
                })}
              </>
            )
          })()}
        </div>
        <div className="w-72">
          <TagSidebar tagInstances={tagInstances} />
        </div>
      </div>
      <Checklist ref={checklistRef} section={currentSection} />
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

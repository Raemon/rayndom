'use client'
import { useEffect, useMemo, useState, useRef, useLayoutEffect, useCallback } from 'react'
import { useTimeblocks } from '../hooks/useTimeblocks'
import { useTagInstances } from '../hooks/useTagInstances'
import { FocusedNotesProvider, useFocusedNotes } from '../context/FocusedNotesContext'
import { TagsProvider, useTags } from '../tags/TagsContext'
import MarkdownContent from '../../common/MarkdownContent'
import Checklist from '../checklist/Checklist'
import ZenRow from '../zen/ZenRow'
import DaySection from './DaySection'
import MonthSection from './MonthSection'
import { useTimelineGrouping } from './useTimelineGrouping'
import type { TagInstance, Timeblock } from '../types'
import Timer from './Timer'
import RunAiCommandButton from '../zen/RunAiCommandButton'
import { useAiTags } from '../hooks/useAiTags'
import { allTagInstancesStartIso, allTagInstancesEndIso } from '../tagInstanceConstants'
import { EMPTY_TIMEBLOCKS, EMPTY_TAG_INSTANCES } from './constants'
import { dayKey } from '../lib/timeUtils'
import { LOGGING_HEADER_OFFSET } from '../layoutConstants'

const timeblockMs = (tb: Timeblock) => new Date(tb.datetime).getTime()
const tagInstanceMs = (ti: TagInstance) => new Date(ti.datetime).getTime()

// Referentially stable "before the boundary" slice. The full timeblocks/tagInstances arrays get
// a new identity on every today-only edit (one element is replaced), which would otherwise
// rebuild the historical grouping and every month's aggregates each keystroke. The historical
// elements keep their identity, so when the kept slice is element-wise unchanged we keep the
// previous reference via React's "adjust state during render" pattern (re-renders synchronously,
// no flash, no ref reads in render).
const useHistoricalSlice = <T,>(items: T[], boundaryMs: number, getMs: (item: T) => number): T[] => {
  const next = useMemo(() => items.filter(item => getMs(item) < boundaryMs), [items, boundaryMs, getMs])
  const [stable, setStable] = useState(next)
  if (stable !== next && !(stable.length === next.length && stable.every((item, i) => item === next[i]))) {
    setStable(next)
  }
  return stable
}

const LoggingZenInner = () => {
  const { isPredicting, predictTags } = useAiTags()
  const { focusedNoteKeysRef } = useFocusedNotes()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const startIso = today.toISOString()
  const endIso = tomorrow.toISOString()
  const { timeblocks, createTimeblock, patchTimeblockDebounced, refreshUnfocused } = useTimeblocks({ start: startIso, end: endIso })
  // Two-phase load: today's tag instances first (fast, ~150 ms) so the rows render immediately,
  // then the full historical set in the background for tag suggestion counts. Polling only
  // refreshes today since older tag instances don't change.
  const { tagInstances, loadRange: loadTagInstancesRange, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance } = useTagInstances({ start: startIso, end: endIso, autoLoad: false })
  const { tags } = useTags()
  const tagTypes = useMemo(() => {
    const availableTypes = ['Projects', 'Triggers','Techniques']
    const filtered = availableTypes.filter(t => tags.some(tag => tag.type === t))
    if (tags.length > 0 && filtered.length === 0) {
      console.warn('No tags match expected types. Available tag types:', [...new Set(tags.map(t => t.type))])
    }
    return filtered
  }, [tags])

  const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  const currentBlockDatetime = floorTo15(new Date()).toISOString()
  const currentTimeblock = timeblocks.find(tb => new Date(tb.datetime).toISOString() === currentBlockDatetime)
  const ensureCurrentTimeblock = async () => {
    if (currentTimeblock) return currentTimeblock
    const created = await createTimeblock({ datetime: currentBlockDatetime, rayNotes: null, assistantNotes: null, aiNotes: null })
    return created as Timeblock
  }

  // Previous timestamp (15 min before current)
  const prevBlockDatetime = new Date(new Date(currentBlockDatetime).getTime() - 15 * 60 * 1000).toISOString()
  const previousTimeblock = timeblocks.find(tb => new Date(tb.datetime).toISOString() === prevBlockDatetime)

  // All other earlier timeblocks today with notes (excluding the previous one). Earlier
  // days are rendered below as collapsed sections instead of as live editor rows.
  const otherBlocksWithNotes = timeblocks
    .filter(tb => {
      const tbTime = new Date(tb.datetime).toISOString()
      return tbTime >= startIso && tbTime < currentBlockDatetime && tbTime !== prevBlockDatetime && (tb.rayNotes || tb.assistantNotes || tb.aiNotes)
    })
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

  // Initial load: today first (fast, unblocks row render), then full history in background
  // for the suggestion counts / typeahead.
  useEffect(() => {
    let cancelled = false
    const runInitialLoad = async () => {
      await loadTagInstancesRange({ start: startIso, end: endIso })
      if (cancelled) return
      loadTagInstancesRange({ start: allTagInstancesStartIso, end: allTagInstancesEndIso })
    }
    runInitialLoad()
    return () => { cancelled = true }
  }, [loadTagInstancesRange, startIso, endIso])

  // Poll today every 5 seconds. Older tag instances are immutable, so no need to refetch them.
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnfocused(focusedNoteKeysRef.current)
      loadTagInstancesRange({ start: startIso, end: endIso })
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeysRef, loadTagInstancesRange, startIso, endIso])

  // Bucket tag instances by 15-minute slot once per tagInstances change, instead of
  // re-scanning all ~1.5k rows for each ZenRow on every render.
  const tagInstancesBySlotMs = useMemo(() => {
    const bySlot = new Map<number, TagInstance[]>()
    for (const tagInstance of tagInstances) {
      const slotMs = floorTo15(new Date(tagInstance.datetime)).getTime()
      let bucket = bySlot.get(slotMs)
      if (!bucket) { bucket = []; bySlot.set(slotMs, bucket) }
      bucket.push(tagInstance)
    }
    return bySlot
  }, [tagInstances])

  const tagTypeById = useMemo(() => {
    const lookup = new Map<number, string>()
    for (const tag of tags) lookup.set(tag.id, tag.type)
    return lookup
  }, [tags])

  const getTagInstancesByType = (datetime: string) => {
    const slotMs = floorTo15(new Date(datetime)).getTime()
    const slotInstances = tagInstancesBySlotMs.get(slotMs) || []
    const byType: Record<string, TagInstance[]> = {}
    for (const type of tagTypes) byType[type] = []
    for (const tagInstance of slotInstances) {
      const type = tagInstance.tag?.type || tagTypeById.get(tagInstance.tagId) || ''
      if (byType[type]) byType[type].push(tagInstance)
    }
    return byType
  }

  // Group everything before today into collapsible day/week/month sections (shared with the
  // main page) so historical days render as cheap summaries instead of mounting an editor each.
  // Feed the grouping only the immutable historical slice (stable across today-only edits) so
  // typing in the current block doesn't recompute every month's aggregates.
  const todayStartMs = today.getTime()
  const historicalTimeblocks = useHistoricalSlice(timeblocks, todayStartMs, timeblockMs)
  const historicalTagInstances = useHistoricalSlice(tagInstances, todayStartMs, tagInstanceMs)
  const { timeblocksByDay, tagInstancesByDay, groupedDays } = useTimelineGrouping(historicalTimeblocks, historicalTagInstances)
  const previousWeekDays = useMemo(
    () => groupedDays.currentWeekDays.filter(d => d.getTime() !== groupedDays.today.getTime()),
    [groupedDays]
  )
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({})
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({})
  // Previous days and months start collapsed; the zen view doesn't group by weeks at all,
  // so an expanded month lists its days directly.
  const onToggleDayCollapsed = useCallback((key: string) => setCollapsedDays(prev => ({ ...prev, [key]: !(prev[key] ?? true) })), [])
  const onToggleMonthCollapsed = useCallback((key: string) => setCollapsedMonths(prev => ({ ...prev, [key]: !(prev[key] ?? true) })), [])

  // Stable callback identities so the memoized day/month sections don't re-render every poll cycle.
  const callbacksRef = useRef({ createTimeblock, patchTimeblockDebounced, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance })
  useLayoutEffect(() => {
    callbacksRef.current = { createTimeblock, patchTimeblockDebounced, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance }
  })
  const onCreateTimeblock = useCallback(async (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => (await callbacksRef.current.createTimeblock(args)) as Timeblock, [])
  const onPatchTimeblockDebounced = useCallback((args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, debounceMs?: number }) => callbacksRef.current.patchTimeblockDebounced(args), [])
  const onCreateTagInstance = useCallback((args: { tagId: number, datetime: string, approved?: boolean }) => callbacksRef.current.createTagInstance(args), [])
  const onApproveTagInstance = useCallback((args: { id: number }) => callbacksRef.current.approveTagInstance(args), [])
  const onPatchTagInstance = useCallback((args: { id: number, useful?: boolean, antiUseful?: boolean }) => callbacksRef.current.patchTagInstance(args), [])
  const onDeleteTagInstance = useCallback((args: { id: number }) => callbacksRef.current.deleteTagInstance(args), [])

  const currentTime = new Date(currentBlockDatetime)
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const handleRunAiCommand = async (datetime: string) => {
    await predictTags({ datetime })
    refreshUnfocused(new Set())
  }

  return (
    <div className="flex" style={{ height: `calc(100vh - ${LOGGING_HEADER_OFFSET})`, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto' }} className="p-2 text-sm">
        <Timer isPredicting={isPredicting} onRunAiCommand={handleRunAiCommand} />
        <RunAiCommandButton datetime={currentBlockDatetime} onComplete={() => refreshUnfocused(new Set())} />
        <MarkdownContent html={currentTimeblock?.aiNotes || ''} />
      </div>
      <div style={{ flex: '0 0 640px', minWidth: 640, overflow: 'auto' }} className="p-2">
        <ZenRow
          timeblock={currentTimeblock}
          timeLabel={currentTimeStr}
          ensureTimeblock={ensureCurrentTimeblock}
          onPatchTimeblockDebounced={patchTimeblockDebounced}
          minHeight={`calc(100vh - ${LOGGING_HEADER_OFFSET} - 32px)`}
          datetime={currentBlockDatetime}
          tagTypes={tagTypes}
          tagInstancesByType={getTagInstancesByType(currentBlockDatetime)}
          allTagInstances={tagInstances}
          onCreateTagInstance={createTagInstance}
          onApproveTagInstance={approveTagInstance}
          onPatchTagInstance={patchTagInstance}
          onDeleteTagInstance={deleteTagInstance}
        />
        {previousTimeblock && (
          <ZenRow
            timeblock={previousTimeblock}
            timeLabel={new Date(prevBlockDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            ensureTimeblock={async () => previousTimeblock}
            onPatchTimeblockDebounced={patchTimeblockDebounced}
            datetime={prevBlockDatetime}
            tagTypes={tagTypes}
            tagInstancesByType={getTagInstancesByType(prevBlockDatetime)}
            allTagInstances={tagInstances}
            onCreateTagInstance={createTagInstance}
            onApproveTagInstance={approveTagInstance}
            onPatchTagInstance={patchTagInstance}
            onDeleteTagInstance={deleteTagInstance}
          />
        )}
        {otherBlocksWithNotes.map(tb => {
          const time = new Date(tb.datetime)
          const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          return (
            <ZenRow
              key={tb.id}
              timeblock={tb}
              timeLabel={timeStr}
              ensureTimeblock={async () => tb}
              onPatchTimeblockDebounced={patchTimeblockDebounced}
              datetime={tb.datetime}
              tagTypes={tagTypes}
              tagInstancesByType={getTagInstancesByType(tb.datetime)}
              allTagInstances={tagInstances}
              onCreateTagInstance={createTagInstance}
              onApproveTagInstance={approveTagInstance}
              onPatchTagInstance={patchTagInstance}
              onDeleteTagInstance={deleteTagInstance}
            />
          )
        })}
        {previousWeekDays.map(day => {
          const key = dayKey(day)
          return (
            <DaySection
              key={key}
              dayKey={key}
              day={day}
              zen
              isCollapsed={collapsedDays[key] ?? true}
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
        {groupedDays.previousMonths.map(({ month, weeks }) => {
          const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
          return (
            <MonthSection
              key={monthKey}
              monthKey={monthKey}
              month={month}
              weeks={weeks}
              isCollapsed={collapsedMonths[monthKey] ?? true}
              zen
              onToggleCollapsed={onToggleMonthCollapsed}
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
      <div style={{ flex: 1, overflow: 'auto' }} className="p-2">
        <Checklist />
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const LoggingZen = ({}:{}) => (
  <FocusedNotesProvider>
    <TagsProvider>
      <LoggingZenInner />
    </TagsProvider>
  </FocusedNotesProvider>
)

export default LoggingZen

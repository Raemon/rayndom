'use client'
import { memo, useMemo } from 'react'
import DaySection from './DaySection'
import CollapsedSummary from './CollapsedSummary'
import { useCollapsedTagCounts } from './useCollapsedTagCounts'
import { useTags } from '../tags/TagsContext'
import type { TagInstance, Timeblock } from '../types'
import CollapsedNotesSummary from './CollapsedNotesSummary'
import { EMPTY_TIMEBLOCKS, EMPTY_TAG_INSTANCES } from './constants'
import { dayKey } from '../lib/timeUtils'

const formatWeekLabel = (monday: Date) => {
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

const WeekSection = memo(({ weekKey, monday, days, isCollapsed, onToggleCollapsed, collapsedDays, onToggleDayCollapsed, timeblocksByDay, tagInstancesByDay, allTagInstances, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  weekKey: string,
  monday: Date,
  days: Date[],
  isCollapsed: boolean,
  onToggleCollapsed: (key: string) => void,
  collapsedDays: Record<string, boolean>,
  onToggleDayCollapsed: (key: string) => void,
  timeblocksByDay: Map<string, Timeblock[]>,
  tagInstancesByDay: Map<string, TagInstance[]>,
  allTagInstances: TagInstance[],
  onCreateTimeblock: (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, debounceMs?: number }) => void,
  onCreateTagInstance: (args: { tagId: number, datetime: string, approved?: boolean }) => Promise<TagInstance>,
  onApproveTagInstance: (args: { id: number }) => Promise<void> | void,
  onPatchTagInstance: (args: { id: number, useful?: boolean, antiUseful?: boolean }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const { tags } = useTags()
  const tagTypes = useMemo(() => {
    const availableTypes = ['Projects', 'Triggers', 'Techniques']
    return availableTypes.filter(t => tags.some(tag => tag.type === t))
  }, [tags])
  const weekTimeblocks = useMemo(() => {
    const result: Timeblock[] = []
    for (const day of days) {
      const slice = timeblocksByDay.get(dayKey(day))
      if (slice) result.push(...slice)
    }
    return result
  }, [days, timeblocksByDay])
  const weekTagInstances = useMemo(() => {
    const result: TagInstance[] = []
    for (const day of days) {
      const slice = tagInstancesByDay.get(dayKey(day))
      if (slice) result.push(...slice)
    }
    return result
  }, [days, tagInstancesByDay])
  const tagCountsByType = useCollapsedTagCounts(weekTagInstances, tags, tagTypes)
  const sortedDays = useMemo(() => [...days].sort((a, b) => b.getTime() - a.getTime()), [days])
  return (
    <div className="border-b border-gray-200 px-4 pb-3">
      {isCollapsed ? (
        <CollapsedSummary
          tagTypes={tagTypes}
          tagCountsByType={tagCountsByType}
          header={<>
            <button className="text-left font-semibold whitespace-nowrap" onClick={() => onToggleCollapsed(weekKey)}>
              ▶ <span className="text-3xl">{formatWeekLabel(monday)}</span>
            </button>
            <CollapsedNotesSummary timeblocks={weekTimeblocks} onPatchTimeblockDebounced={onPatchTimeblockDebounced} />
          </>}
        />
      ) : (
        <div className="py-4">
          <button className="text-left font-semibold whitespace-nowrap" onClick={() => onToggleCollapsed(weekKey)}>
            ▼ <span className="text-3xl">{formatWeekLabel(monday)}</span>
          </button>
        </div>
      )}
      {!isCollapsed && sortedDays.map(day => {
        const key = dayKey(day)
        const isDayCollapsed = collapsedDays[key] ?? true
        return (
          <DaySection
            key={key}
            dayKey={key}
            day={day}
            isCollapsed={isDayCollapsed}
            onToggleCollapsed={onToggleDayCollapsed}
            dayTimeblocks={timeblocksByDay.get(key) || EMPTY_TIMEBLOCKS}
            dayTagInstances={tagInstancesByDay.get(key) || EMPTY_TAG_INSTANCES}
            allTagInstances={allTagInstances}
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
  )
})
WeekSection.displayName = 'WeekSection'

export default WeekSection

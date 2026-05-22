'use client'
import { memo, useMemo } from 'react'
import WeekSection from './WeekSection'
import DaySection from './DaySection'
import CollapsedSummary from './CollapsedSummary'
import { useCollapsedTagCounts } from './useCollapsedTagCounts'
import { useTags } from '../tags/TagsContext'
import type { TagInstance, Timeblock } from '../types'
import CollapsedNotesSummary from './CollapsedNotesSummary'
import { EMPTY_TIMEBLOCKS, EMPTY_TAG_INSTANCES } from './constants'
import { dayKey } from '../lib/timeUtils'

const formatMonthLabel = (date: Date) => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

type MonthSectionCommonProps = {
  monthKey: string,
  month: Date,
  weeks: { monday: Date, days: Date[] }[],
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
}

// Two layouts, selected by `zen`. The default (main page) groups a month's days by week, so it needs
// the week collapse state and toggle; zen lists the days flat and stacks the collapsed summary as a
// column for the narrow panel, needing neither.
type MonthSectionProps = MonthSectionCommonProps & (
  | { zen?: false, isNewestMonth?: boolean, collapsedWeeks: Record<string, boolean>, onToggleWeekCollapsed: (key: string) => void }
  | { zen: true }
)

const MonthSection = memo((props: MonthSectionProps) => {
  const { monthKey, month, weeks, isCollapsed, zen, onToggleCollapsed, collapsedDays, onToggleDayCollapsed, timeblocksByDay, tagInstancesByDay, allTagInstances, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance } = props
  // Narrow to the week-grouped variant once, as a const, so the value (and its required
  // week props) stays narrowed inside the render closures below.
  const weekMode = props.zen ? undefined : props
  const { tags } = useTags()
  const tagTypes = useMemo(() => {
    const availableTypes = ['Projects', 'Triggers', 'Techniques']
    return availableTypes.filter(t => tags.some(tag => tag.type === t))
  }, [tags])
  const monthTimeblocks = useMemo(() => {
    const result: Timeblock[] = []
    for (const week of weeks) {
      for (const day of week.days) {
        const slice = timeblocksByDay.get(dayKey(day))
        if (slice) result.push(...slice)
      }
    }
    return result
  }, [weeks, timeblocksByDay])
  const monthTagInstances = useMemo(() => {
    const result: TagInstance[] = []
    for (const week of weeks) {
      for (const day of week.days) {
        const slice = tagInstancesByDay.get(dayKey(day))
        if (slice) result.push(...slice)
      }
    }
    return result
  }, [weeks, tagInstancesByDay])
  const tagCountsByType = useCollapsedTagCounts(monthTagInstances, tags, tagTypes)
  const sortedWeeks = useMemo(() => [...weeks].sort((a, b) => b.monday.getTime() - a.monday.getTime()), [weeks])
  const sortedDays = useMemo(() => weeks.flatMap(w => w.days).sort((a, b) => b.getTime() - a.getTime()), [weeks])
  return (
    <div className="border-b border-gray-200 px-4 pb-3">
      {isCollapsed ? (
        <CollapsedSummary
          zen={zen}
          tagTypes={tagTypes}
          tagCountsByType={tagCountsByType}
          header={<>
            <button className="text-left font-semibold whitespace-nowrap" onClick={() => onToggleCollapsed(monthKey)}>
              ▶ <span className="text-4xl">{formatMonthLabel(month)}</span>
            </button>
            <CollapsedNotesSummary timeblocks={monthTimeblocks} onPatchTimeblockDebounced={onPatchTimeblockDebounced} />
          </>}
        />
      ) : (
        <div className="py-4">
          <button className="text-left font-semibold whitespace-nowrap" onClick={() => onToggleCollapsed(monthKey)}>
            ▼ <span className="text-4xl">{formatMonthLabel(month)}</span>
          </button>
        </div>
      )}
      {!isCollapsed && (weekMode ? sortedWeeks.map(({ monday, days }, weekIdx) => {
        const weekKey = dayKey(monday)
        const isWeekCollapsed = weekMode.collapsedWeeks[weekKey] ?? !(weekMode.isNewestMonth && weekIdx === 0)
        return (
          <WeekSection
            key={weekKey}
            weekKey={weekKey}
            monday={monday}
            days={days}
            isCollapsed={isWeekCollapsed}
            onToggleCollapsed={weekMode.onToggleWeekCollapsed}
            collapsedDays={collapsedDays}
            onToggleDayCollapsed={onToggleDayCollapsed}
            timeblocksByDay={timeblocksByDay}
            tagInstancesByDay={tagInstancesByDay}
            allTagInstances={allTagInstances}
            onCreateTimeblock={onCreateTimeblock}
            onPatchTimeblockDebounced={onPatchTimeblockDebounced}
            onCreateTagInstance={onCreateTagInstance}
            onApproveTagInstance={onApproveTagInstance}
            onPatchTagInstance={onPatchTagInstance}
            onDeleteTagInstance={onDeleteTagInstance}
          />
        )
      }) : sortedDays.map(day => {
        const key = dayKey(day)
        return (
          <DaySection
            key={key}
            dayKey={key}
            day={day}
            zen={zen}
            isCollapsed={collapsedDays[key] ?? true}
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
      }))}
    </div>
  )
})
MonthSection.displayName = 'MonthSection'

export default MonthSection

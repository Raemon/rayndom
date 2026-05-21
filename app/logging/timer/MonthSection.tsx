'use client'
import { memo, useMemo } from 'react'
import { countBy, orderBy } from 'lodash'
import WeekSection from './WeekSection'
import DaySection from './DaySection'
import TagListItem from '../tags/TagListItem'
import { useTags } from '../tags/TagsContext'
import type { Tag, TagInstance, Timeblock } from '../types'
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

// Two modes: grouped by weeks (main page, the default) requires the week collapse state and
// toggle; flat (zen view, groupByWeeks=false) lists days directly and needs neither.
type MonthSectionProps = MonthSectionCommonProps & (
  | { groupByWeeks?: true, isNewestMonth?: boolean, collapsedWeeks: Record<string, boolean>, onToggleWeekCollapsed: (key: string) => void }
  | { groupByWeeks: false }
)

const MonthSection = memo((props: MonthSectionProps) => {
  const { monthKey, month, weeks, isCollapsed, onToggleCollapsed, collapsedDays, onToggleDayCollapsed, timeblocksByDay, tagInstancesByDay, allTagInstances, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance } = props
  // Narrow to the week-grouped variant once, as a const, so the value (and its required
  // week props) stays narrowed inside the render closures below.
  const weekMode = props.groupByWeeks === false ? undefined : props
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
  const tagCountsByType = useMemo(() => {
    const counts = countBy(monthTagInstances, ti => ti.tagId)
    const usefulCounts = countBy(monthTagInstances.filter(ti => ti.useful), ti => ti.tagId)
    const antiUsefulCounts = countBy(monthTagInstances.filter(ti => ti.antiUseful), ti => ti.tagId)
    const tagCountPairs = Object.entries(counts).map(([tagId, count]) => {
      const tag = tags.find(t => t.id === Number(tagId))
      return { tag, count, usefulCount: usefulCounts[tagId] || 0, antiUsefulCount: antiUsefulCounts[tagId] || 0 }
    }).filter((pair): pair is { tag: Tag, count: number, usefulCount: number, antiUsefulCount: number } => pair.tag !== undefined)
    const sorted = orderBy(tagCountPairs, [p => p.usefulCount > 0 ? 2 : p.antiUsefulCount > 0 ? 1 : 0, 'count'], ['desc', 'desc'])
    const byType: Record<string, { tag: Tag, count: number, usefulCount: number, antiUsefulCount: number }[]> = {}
    for (const type of tagTypes) byType[type] = []
    for (const pair of sorted) {
      const type = pair.tag.type
      if (byType[type]) byType[type].push(pair)
    }
    return byType
  }, [monthTagInstances, tags, tagTypes])
  const sortedWeeks = useMemo(() => [...weeks].sort((a, b) => b.monday.getTime() - a.monday.getTime()), [weeks])
  const sortedDays = useMemo(() => weeks.flatMap(w => w.days).sort((a, b) => b.getTime() - a.getTime()), [weeks])
  return (
    <div className="border-b border-gray-200 px-4 pb-3">
      <div className="flex gap-4 items-start py-4">
        {isCollapsed ? (
          <div className="shrink-0" style={{ width: '40%' }}>
            <button className="text-left font-semibold" onClick={() => onToggleCollapsed(monthKey)}>
              ▶ <span className="text-4xl">{formatMonthLabel(month)}</span>
            </button>
            <CollapsedNotesSummary timeblocks={monthTimeblocks} onPatchTimeblockDebounced={onPatchTimeblockDebounced} />
          </div>
        ) : (
          <button className="text-left font-semibold shrink-0 whitespace-nowrap" onClick={() => onToggleCollapsed(monthKey)}>
            ▼ <span className="text-4xl">{formatMonthLabel(month)}</span>
          </button>
        )}
        {isCollapsed && tagTypes.map(type => (
          <div key={type} className="flex-1 flex flex-wrap gap-x-2 gap-y-1 overflow-hidden">
            {tagCountsByType[type]?.map(({ tag, count, usefulCount, antiUsefulCount }) => (
              <TagListItem key={tag.id} tag={tag} instanceCount={count} usefulCount={usefulCount} antiUsefulCount={antiUsefulCount} readonly hideRelations />
            ))}
          </div>
        ))}
      </div>
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

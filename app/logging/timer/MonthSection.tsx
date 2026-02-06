'use client'
import { useMemo } from 'react'
import { countBy, orderBy } from 'lodash'
import WeekSection from './WeekSection'
import TagListItem from '../tags/TagListItem'
import { useTags } from '../tags/TagsContext'
import type { Tag, TagInstance, Timeblock } from '../types'

const formatMonthLabel = (date: Date) => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

const MonthSection = ({ month, weeks, isCollapsed, onToggleCollapsed, collapsedWeeks, onToggleWeekCollapsed, collapsedDays, onToggleDayCollapsed, timeblocks, tagInstances, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  month: Date,
  weeks: { monday: Date, days: Date[] }[],
  isCollapsed: boolean,
  onToggleCollapsed: () => void,
  collapsedWeeks: Record<string, boolean>,
  onToggleWeekCollapsed: (key: string) => void,
  collapsedDays: Record<string, boolean>,
  onToggleDayCollapsed: (key: string) => void,
  timeblocks: Timeblock[],
  tagInstances: TagInstance[],
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
  const monthStart = useMemo(() => new Date(month.getFullYear(), month.getMonth(), 1, 0, 0, 0, 0), [month])
  const monthEnd = useMemo(() => new Date(month.getFullYear(), month.getMonth() + 1, 1, 0, 0, 0, 0), [month])
  const monthTagInstances = useMemo(() => tagInstances.filter(ti => {
    const d = new Date(ti.datetime)
    return d >= monthStart && d < monthEnd
  }), [tagInstances, monthStart, monthEnd])
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
  return (
    <div className="border-b border-gray-200 px-4 pb-3">
      <div className="flex gap-4 items-start py-4">
        <button className="text-left font-semibold shrink-0 whitespace-nowrap" style={{ width: isCollapsed ? '40%' : undefined }} onClick={onToggleCollapsed}>
          {isCollapsed ? '▶' : '▼'} <span className="text-4xl">{formatMonthLabel(month)}</span>
        </button>
        {isCollapsed && tagTypes.map(type => (
          <div key={type} className="flex-1 flex flex-wrap gap-x-2 gap-y-1 overflow-hidden">
            {tagCountsByType[type]?.map(({ tag, count, usefulCount, antiUsefulCount }) => (
              <TagListItem key={tag.id} tag={tag} instanceCount={count} usefulCount={usefulCount} antiUsefulCount={antiUsefulCount} readonly hideRelations />
            ))}
          </div>
        ))}
      </div>
      {!isCollapsed && sortedWeeks.map(({ monday, days }) => {
        const weekKey = monday.toISOString().slice(0, 10)
        const isWeekCollapsed = collapsedWeeks[weekKey] ?? true
        return (
          <WeekSection
            key={weekKey}
            monday={monday}
            days={days}
            isCollapsed={isWeekCollapsed}
            onToggleCollapsed={() => onToggleWeekCollapsed(weekKey)}
            collapsedDays={collapsedDays}
            onToggleDayCollapsed={onToggleDayCollapsed}
            timeblocks={timeblocks}
            tagInstances={tagInstances}
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
}

export default MonthSection

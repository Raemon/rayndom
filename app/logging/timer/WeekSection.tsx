'use client'
import { useMemo } from 'react'
import { countBy, orderBy } from 'lodash'
import DaySection from './DaySection'
import TagListItem from '../tags/TagListItem'
import { useTags } from '../tags/TagsContext'
import type { Tag, TagInstance, Timeblock } from '../types'

const formatWeekLabel = (monday: Date) => {
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

const WeekSection = ({ monday, days, isCollapsed, onToggleCollapsed, collapsedDays, onToggleDayCollapsed, timeblocks, tagInstances, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  monday: Date,
  days: Date[],
  isCollapsed: boolean,
  onToggleCollapsed: () => void,
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
  const weekStart = useMemo(() => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0), [monday])
  const weekEnd = useMemo(() => new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000), [weekStart])
  const weekTagInstances = useMemo(() => tagInstances.filter(ti => {
    const d = new Date(ti.datetime)
    return d >= weekStart && d < weekEnd
  }), [tagInstances, weekStart, weekEnd])
  const tagCountsByType = useMemo(() => {
    const counts = countBy(weekTagInstances, ti => ti.tagId)
    const usefulCounts = countBy(weekTagInstances.filter(ti => ti.useful), ti => ti.tagId)
    const antiUsefulCounts = countBy(weekTagInstances.filter(ti => ti.antiUseful), ti => ti.tagId)
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
  }, [weekTagInstances, tags, tagTypes])
  const sortedDays = useMemo(() => [...days].sort((a, b) => b.getTime() - a.getTime()), [days])
  return (
    <div className="border-b border-gray-200 px-4 pb-3">
      <div className="flex gap-4 items-start py-4">
        <button className="text-left font-semibold shrink-0 whitespace-nowrap" style={{ width: isCollapsed ? '40%' : undefined }} onClick={onToggleCollapsed}>
          {isCollapsed ? '▶' : '▼'} <span className="text-3xl">{formatWeekLabel(monday)}</span>
        </button>
        {isCollapsed && tagTypes.map(type => (
          <div key={type} className="flex-1 flex flex-wrap gap-x-2 gap-y-1 overflow-hidden">
            {tagCountsByType[type]?.map(({ tag, count, usefulCount, antiUsefulCount }) => (
              <TagListItem key={tag.id} tag={tag} instanceCount={count} usefulCount={usefulCount} antiUsefulCount={antiUsefulCount} readonly hideRelations />
            ))}
          </div>
        ))}
      </div>
      {!isCollapsed && sortedDays.map(day => {
        const key = day.toISOString().slice(0, 10)
        const isDayCollapsed = collapsedDays[key] ?? true
        return (
          <DaySection
            key={key}
            day={day}
            isCollapsed={isDayCollapsed}
            onToggleCollapsed={() => onToggleDayCollapsed(key)}
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

export default WeekSection

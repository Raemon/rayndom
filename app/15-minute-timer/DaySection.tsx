'use client'
import { useMemo, useState, useEffect } from 'react'
import { countBy, orderBy } from 'lodash'
import TimeBlockRow from './TimeBlockRow'
import TagListItem from './TagListItem'
import { useTags } from './TagsContext'
import type { Tag, TagInstance, Timeblock } from './types'

const formatDayLabel = (day: Date) => day.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })

const formatHm = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

const dayStartIso = (day: Date) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0).toISOString()

const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

const makeSlotsForDay = ({ day, startMinutes=9*60+30, endMinutes=20*60+30 }:{ day: Date, startMinutes?: number, endMinutes?: number }) => {
  const slots: Date[] = []
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 15) {
    slots.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes, 0, 0))
  }
  return slots
}

const DaySection = ({ day, isCollapsed, onToggleCollapsed, timeblocks, tagInstances, showOnlyWithContent, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onDeleteTagInstance }:{
  day: Date,
  isCollapsed: boolean,
  onToggleCollapsed: () => void,
  timeblocks: Timeblock[],
  tagInstances: TagInstance[],
  showOnlyWithContent: boolean,
  onCreateTimeblock: (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null }) => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, debounceMs?: number }) => void,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const { tags } = useTags()
  const tagTypes = useMemo(() => ['Projects', '???','Techniques'].filter(t => tags.some(tag => tag.type === t)), [tags])
  const slots = useMemo(() => makeSlotsForDay({ day }), [day])
  const dayStart = useMemo(() => new Date(dayStartIso(day)), [day])
  const dayEnd = useMemo(() => new Date(dayStart.getTime() + 24 * 60 * 60 * 1000), [dayStart])

  const dayTimeblocks = useMemo(() => timeblocks.filter(tb => {
    const d = new Date(tb.datetime)
    return d >= dayStart && d < dayEnd
  }), [timeblocks, dayStart, dayEnd])

  const dayTagInstances = useMemo(() => tagInstances.filter(ti => {
    const d = new Date(ti.datetime)
    return d >= dayStart && d < dayEnd
  }), [tagInstances, dayStart, dayEnd])

  const tagCountsByType = useMemo(() => {
    const counts = countBy(dayTagInstances, ti => ti.tagId)
    const tagCountPairs = Object.entries(counts).map(([tagId, count]) => {
      const tag = tags.find(t => t.id === Number(tagId))
      return { tag, count }
    }).filter((pair): pair is { tag: Tag, count: number } => pair.tag !== undefined)
    const sorted = orderBy(tagCountPairs, ['count'], ['desc'])
    const byType: Record<string, { tag: Tag, count: number }[]> = {}
    for (const type of tagTypes) byType[type] = []
    for (const pair of sorted) {
      const type = pair.tag.type
      if (byType[type]) byType[type].push(pair)
    }
    return byType
  }, [dayTagInstances, tags, tagTypes])

  const slotToTimeblock = useMemo(() => {
    const map = new Map<number, Timeblock>()
    const sorted = [...dayTimeblocks].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    for (const tb of sorted) {
      const slot = floorTo15(new Date(tb.datetime)).getTime()
      map.set(slot, tb)
    }
    return map
  }, [dayTimeblocks])

  const slotKeyToTagInstances = useMemo(() => {
    const map = new Map<string, TagInstance[]>()
    for (const ti of dayTagInstances) {
      const slot = floorTo15(new Date(ti.datetime)).getTime()
      const type = ti.tag?.type || tags.find(t => t.id === ti.tagId)?.type || ''
      const key = `${slot}:${type}`
      map.set(key, [...(map.get(key) || []), ti])
    }
    return map
  }, [dayTagInstances, tags])

  const slotsToShow = useMemo(() => {
    if (!showOnlyWithContent) return slots
    return slots.filter(slotStart => {
      const slotMs = slotStart.getTime()
      const tb = slotToTimeblock.get(slotMs)
      const hasNotes = tb && ((tb.rayNotes && tb.rayNotes.trim() !== '') || (tb.assistantNotes && tb.assistantNotes.trim() !== ''))
      const hasTags = tagTypes.some(type => {
        const key = `${slotMs}:${type}`
        const instances = slotKeyToTagInstances.get(key) || []
        return instances.length > 0
      })
      return hasNotes || hasTags
    })
  }, [slots, showOnlyWithContent, slotToTimeblock, tagTypes, slotKeyToTagInstances])
  const [currentSlotMs, setCurrentSlotMs] = useState(() => floorTo15(new Date()).getTime())
  useEffect(() => {
    const interval = setInterval(() => setCurrentSlotMs(floorTo15(new Date()).getTime()), 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-3">
      {isCollapsed ? (
        <div className="flex gap-4 items-start">
          <button className="text-left font-semibold shrink-0 whitespace-nowrap" style={{ width: '40%' }} onClick={onToggleCollapsed}>
            ▶ {formatDayLabel(day)}
          </button>
          {tagTypes.map(type => (
            <div key={type} className="flex-1 flex flex-wrap gap-x-2 gap-y-0 overflow-hidden">
              {tagCountsByType[type]?.map(({ tag, count }) => (
                <TagListItem key={tag.id} tag={tag} instanceCount={count} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <button className="text-left w-full" onClick={onToggleCollapsed}>
          <div className="font-semibold">▼ {formatDayLabel(day)}</div>
        </button>
      )}
      {!isCollapsed && (
        <table className="mt-2 w-full">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="text-gray-400 text-sm">
              <th className="text-left px-2 py-2" style={{ width: '10%' }}>Time</th>
              <th className="text-left px-2 py-2" style={{ width: '15%' }}>Notes</th>
              <th className="text-left px-2 py-2" style={{ width: '15%' }}>Asst</th>
              {tagTypes.map(type => <th key={type} className="text-left px-2 py-2" style={{ width: `${60 / (tagTypes.length || 1)}%` }}>{type}</th>)}
            </tr>
          </thead>
          <tbody>
            {slotsToShow.map(slotStart => {
              const slotMs = slotStart.getTime()
              const tb = slotToTimeblock.get(slotMs)
              return (
                <TimeBlockRow
                  key={slotMs}
                  slotStart={slotStart}
                  timeLabel={formatHm(slotStart)}
                  timeblock={tb}
                  tagTypes={tagTypes}
                  tagInstancesByType={Object.fromEntries(tagTypes.map(type => {
                    const key = `${slotMs}:${type}`
                    return [type, slotKeyToTagInstances.get(key) || []]
                  }))}
                  allTagInstances={tagInstances}
                  isCurrent={slotMs === currentSlotMs}
                  onCreateTimeblock={onCreateTimeblock}
                  onPatchTimeblockDebounced={onPatchTimeblockDebounced}
                  onCreateTagInstance={onCreateTagInstance}
                  onDeleteTagInstance={onDeleteTagInstance}
                />
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default DaySection

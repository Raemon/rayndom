'use client'
import { useMemo } from 'react'
import TimeBlockRow from './TimeBlockRow'
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

const DaySection = ({ day, isCollapsed, onToggleCollapsed, timeblocks, tags, tagInstances, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTag, onCreateTagInstance, onDeleteTagInstance }:{
  day: Date,
  isCollapsed: boolean,
  onToggleCollapsed: () => void,
  timeblocks: Timeblock[],
  tags: Tag[],
  tagInstances: TagInstance[],
  onCreateTimeblock: (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null }) => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, debounceMs?: number }) => void,
  onCreateTag: (args: { name: string, type: string }) => Promise<Tag>,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const tagTypes = useMemo(() => Array.from(new Set(tags.map(t => t.type))).sort(), [tags])
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

  return (
    <div className="mb-3">
      <button className="text-left w-full" onClick={onToggleCollapsed}>
        <div className="font-semibold">{isCollapsed ? '▶' : '▼'} {formatDayLabel(day)}</div>
      </button>
      {!isCollapsed && (
        <div className="mt-2 flex flex-col gap-1">
          {slots.map(slotStart => {
            const slotMs = slotStart.getTime()
            const tb = slotToTimeblock.get(slotMs)
            return (
              <TimeBlockRow
                key={slotMs}
                slotStart={slotStart}
                timeLabel={formatHm(slotStart)}
                timeblock={tb}
                tagTypes={tagTypes}
                tags={tags}
                tagInstancesByType={Object.fromEntries(tagTypes.map(type => {
                  const key = `${slotMs}:${type}`
                  return [type, slotKeyToTagInstances.get(key) || []]
                }))}
                onCreateTimeblock={onCreateTimeblock}
                onPatchTimeblockDebounced={onPatchTimeblockDebounced}
                onCreateTag={onCreateTag}
                onCreateTagInstance={onCreateTagInstance}
                onDeleteTagInstance={onDeleteTagInstance}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DaySection

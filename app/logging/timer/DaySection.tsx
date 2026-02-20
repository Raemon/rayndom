'use client'
import { useMemo, useState, useEffect } from 'react'
import { countBy, orderBy } from 'lodash'
import TimeBlockRow from './TimeBlockRow'
import TagListItem from '../tags/TagListItem'
import { useTags } from '../tags/TagsContext'
import type { Tag, TagInstance, Timeblock } from '../types'
import { SECTION_DEFINITIONS } from '../checklist/sectionUtils'
import CollapsedNotesSummary from './CollapsedNotesSummary'

const formatDayLabel = (day: Date) => day.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })

const formatHm = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

const dayStartIso = (day: Date) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0).toISOString()

const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

const makeSlotsForDay = ({ day, startMinutes=0, endMinutes=23*60+45 }:{ day: Date, startMinutes?: number, endMinutes?: number }) => {
  const slots: Date[] = []
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 15) {
    slots.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes, 0, 0))
  }
  return slots
}

const DaySection = ({ day, isCollapsed, onToggleCollapsed, timeblocks, tagInstances, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  day: Date,
  isCollapsed: boolean,
  onToggleCollapsed: () => void,
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
    const availableTypes = ['Projects', 'Triggers','Techniques']
    const filtered = availableTypes.filter(t => tags.some(tag => tag.type === t))
    if (tags.length > 0 && filtered.length === 0) {
      console.warn('No tags match expected types. Available tag types:', [...new Set(tags.map(t => t.type))])
    }
    return filtered
  }, [tags])
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
    const usefulCounts = countBy(dayTagInstances.filter(ti => ti.useful), ti => ti.tagId)
    const antiUsefulCounts = countBy(dayTagInstances.filter(ti => ti.antiUseful), ti => ti.tagId)
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

  const [currentSlotMs, setCurrentSlotMs] = useState<number | null>(null)
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, boolean>>({})
  useEffect(() => {
    const updateTime = () => setCurrentSlotMs(floorTo15(new Date()).getTime())
    const timeoutId = setTimeout(updateTime, 0)
    const interval = setInterval(updateTime, 10000)
    return () => { clearTimeout(timeoutId); clearInterval(interval) }
  }, [currentSlotMs])
  const slots = useMemo(() => {
    const hardcodedSlots = makeSlotsForDay({ day })
    const hardcodedMs = new Set(hardcodedSlots.map(s => s.getTime()))
    const extraSlotMs = new Set<number>()
    const timeblocksWithNotes = dayTimeblocks.filter(tb => tb.rayNotes || tb.assistantNotes || tb.aiNotes)
    for (const tb of timeblocksWithNotes) {
      const slotMs = floorTo15(new Date(tb.datetime)).getTime()
      if (!hardcodedMs.has(slotMs)) extraSlotMs.add(slotMs)
    }
    for (const ti of dayTagInstances) {
      const slotMs = floorTo15(new Date(ti.datetime)).getTime()
      if (!hardcodedMs.has(slotMs)) extraSlotMs.add(slotMs)
    }
    if (currentSlotMs !== null) {
      const currentSlotDate = new Date(currentSlotMs)
      if (currentSlotDate >= dayStart && currentSlotDate < dayEnd) {
        if (!hardcodedMs.has(currentSlotMs)) extraSlotMs.add(currentSlotMs)
        const previousSlotMs = currentSlotMs - 15 * 60 * 1000
        const previousSlotDate = new Date(previousSlotMs)
        if (previousSlotDate >= dayStart && previousSlotDate < dayEnd && !hardcodedMs.has(previousSlotMs)) {
          extraSlotMs.add(previousSlotMs)
        }
      }
    }
    const allSlots = [...hardcodedSlots, ...Array.from(extraSlotMs).map(ms => new Date(ms))]
    allSlots.sort((a, b) => a.getTime() - b.getTime())
    return allSlots
  }, [day, dayTimeblocks, dayTagInstances, currentSlotMs, dayStart, dayEnd])
  const sections = useMemo(() => SECTION_DEFINITIONS, [])
  const visibleSlots = useMemo(() => slots.filter(slotStart => {
    const slotMinutes = slotStart.getHours() * 60 + slotStart.getMinutes()
    return slotMinutes <= 23 * 60 + 45
  }), [slots])
  const sectionAutoCollapsed = useMemo(() => {
    const nowMs = currentSlotMs ?? new Date().getTime()
    const autoCollapsed: Record<string, boolean> = {}
    for (const section of sections) {
      const startMs = dayStart.getTime() + section.startMinutes * 60 * 1000
      const endMs = dayStart.getTime() + section.endMinutes * 60 * 1000
      const isBeforeStart = nowMs < startMs
      const isPastEnd = nowMs > endMs
      autoCollapsed[section.key] = isBeforeStart || isPastEnd
    }
    return autoCollapsed
  }, [sections, dayStart, currentSlotMs])

  return (
    <div className={`border-b border-gray-200 px-4 pb-3 ${isCollapsed ? 'bg-white/10' : ''}`}>
      {isCollapsed ? (
        <div className="flex gap-4 items-start py-4">
          <div className="shrink-0" style={{ width: '40%' }}>
            <button className="text-left font-semibold whitespace-nowrap" onClick={onToggleCollapsed}>
              ▶ <span className="text-2xl">{formatDayLabel(day)}</span>
            </button>
            <CollapsedNotesSummary timeblocks={dayTimeblocks} onPatchTimeblockDebounced={onPatchTimeblockDebounced} />
          </div>
          {tagTypes.map(type => (
            <div key={type} className="flex-1 flex flex-wrap gap-x-2 gap-y-1 overflow-hidden">
              {tagCountsByType[type]?.map(({ tag, count, usefulCount, antiUsefulCount }) => (
                <TagListItem key={tag.id} tag={tag} instanceCount={count} usefulCount={usefulCount} antiUsefulCount={antiUsefulCount} readonly hideRelations />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <button className="text-left w-full" onClick={onToggleCollapsed}>
          <div className="font-semibold">▼ <span className="text-2xl">{formatDayLabel(day)}</span></div>
        </button>
      )}
      {!isCollapsed && (
        <table className="mt-2 w-full">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="text-gray-400 text-sm">
              <th className="text-left px-2 py-2" style={{ width: '10%' }}>Time</th>
              <th className="text-left px-2 py-2" style={{ width: '15%' }}>Notes</th>
              <th className="text-left px-2 py-2" style={{ width: '15%' }}>Asst</th>
              <th className="text-left px-2 py-2" style={{ width: '15%' }}>AI</th>
              {tagTypes.map(type => <th key={type} className="text-left px-2 py-2" style={{ width: `${45 / (tagTypes.length || 1)}%` }}>{type}</th>)}
            </tr>
          </thead>
          {sections.map(section => {
            const slotsInSection = visibleSlots.filter(slotStart => {
              const slotMinutes = slotStart.getHours() * 60 + slotStart.getMinutes()
              return slotMinutes >= section.startMinutes && slotMinutes <= section.endMinutes
            })
            const autoCollapsed = sectionAutoCollapsed[section.key]
            const isSectionCollapsed = sectionOverrides[section.key] ?? autoCollapsed
            return (
              <tbody key={section.key}>
                <tr>
                  <td colSpan={4 + tagTypes.length} className="px-2 py-2">
                    <button className="text-left font-semibold" onClick={() => setSectionOverrides(prev => ({ ...prev, [section.key]: !isSectionCollapsed }))}>
                      {isSectionCollapsed ? '▶' : '▼'} {section.label}
                    </button>
                  </td>
                </tr>
                {(isSectionCollapsed ? slotsInSection.filter(slotStart => {
                  const slotMs = slotStart.getTime()
                  const tb = slotToTimeblock.get(slotMs)
                  const hasNotes = tb && (tb.rayNotes || tb.assistantNotes || tb.aiNotes)
                  const hasTagInstances = tagTypes.some(type => (slotKeyToTagInstances.get(`${slotMs}:${type}`) || []).length > 0)
                  return hasNotes || hasTagInstances
                }) : slotsInSection).map(slotStart => {
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
                      onApproveTagInstance={onApproveTagInstance}
                      onPatchTagInstance={onPatchTagInstance}
                      onDeleteTagInstance={onDeleteTagInstance}
                    />
                  )
                })}
              </tbody>
            )
          })}
        </table>
      )}
    </div>
  )
}

export default DaySection

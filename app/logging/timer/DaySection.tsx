'use client'
import { memo, useMemo, useState, useEffect, useCallback } from 'react'
import TimeBlockRow from './TimeBlockRow'
import ZenRow from '../zen/ZenRow'
import CollapsedSummary from './CollapsedSummary'
import { useCollapsedTagCounts } from './useCollapsedTagCounts'
import { useTags } from '../tags/TagsContext'
import type { TagInstance, Timeblock } from '../types'
import { SECTION_DEFINITIONS } from '../checklist/sectionUtils'
import CollapsedNotesSummary from './CollapsedNotesSummary'
import CollapsedDayNotes from './CollapsedDayNotes'
import { formatHm } from '../lib/timeUtils'

const formatDayLabel = (day: Date) => day.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })

const dayStartIso = (day: Date) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0).toISOString()

const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

const makeSlotsForDay = ({ day, startMinutes=0, endMinutes=23*60+45 }:{ day: Date, startMinutes?: number, endMinutes?: number }) => {
  const slots: Date[] = []
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 15) {
    slots.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes, 0, 0))
  }
  return slots
}

const DaySection = memo(({ dayKey, day, isCollapsed, zen, onToggleCollapsed, dayTimeblocks, dayTagInstances, allTagInstances, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  dayKey: string,
  day: Date,
  isCollapsed: boolean,
  // Zen view: stack the collapsed summary as a column (header above its tag-category row) for the narrow panel.
  zen?: boolean,
  onToggleCollapsed: (key: string) => void,
  dayTimeblocks: Timeblock[],
  dayTagInstances: TagInstance[],
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
    const availableTypes = ['Projects', 'Triggers','Techniques']
    const filtered = availableTypes.filter(t => tags.some(tag => tag.type === t))
    if (tags.length > 0 && filtered.length === 0) {
      console.warn('No tags match expected types. Available tag types:', [...new Set(tags.map(t => t.type))])
    }
    return filtered
  }, [tags])
  const dayStart = useMemo(() => new Date(dayStartIso(day)), [day])
  const dayEnd = useMemo(() => new Date(dayStart.getTime() + 24 * 60 * 60 * 1000), [dayStart])

  const tagCountsByType = useCollapsedTagCounts(dayTagInstances, tags, tagTypes)

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

  // Collapsed sections show only filled slots; expanded sections show every slot.
  const slotHasContent = useCallback((slotStart: Date) => {
    const slotMs = slotStart.getTime()
    const tb = slotToTimeblock.get(slotMs)
    const hasNotes = tb && (tb.rayNotes || tb.assistantNotes || tb.aiNotes)
    const hasTagInstances = tagTypes.some(type => (slotKeyToTagInstances.get(`${slotMs}:${type}`) || []).length > 0)
    return hasNotes || hasTagInstances
  }, [slotToTimeblock, tagTypes, slotKeyToTagInstances])

  const tagInstancesByTypeForSlot = (slotMs: number) => Object.fromEntries(
    tagTypes.map(type => [type, slotKeyToTagInstances.get(`${slotMs}:${type}`) || []])
  )

  // Shared per-section view model so the table and zen layouts select identical slots, differing
  // only in the row component. Excludes allTagInstances so the 5s poll doesn't recompute it.
  const sectionViews = useMemo(() => sections.map(section => {
    const slotsInSection = visibleSlots.filter(slotStart => {
      const slotMinutes = slotStart.getHours() * 60 + slotStart.getMinutes()
      return slotMinutes >= section.startMinutes && slotMinutes <= section.endMinutes
    })
    const isSectionCollapsed = sectionOverrides[section.key] ?? sectionAutoCollapsed[section.key]
    const filledSlots = slotsInSection.filter(slotHasContent)
    return { section, isSectionCollapsed, slotsInSection, filledSlots }
  }), [sections, visibleSlots, sectionOverrides, sectionAutoCollapsed, slotHasContent])
  const toggleSection = (key: string, isSectionCollapsed: boolean) =>
    setSectionOverrides(prev => ({ ...prev, [key]: !isSectionCollapsed }))

  return (
    <div className={`border-b border-gray-200 px-4 pb-3 ${isCollapsed ? 'bg-white/10' : ''}`}>
      {isCollapsed ? (
        <CollapsedSummary
          zen={zen}
          tagTypes={tagTypes}
          tagCountsByType={tagCountsByType}
          header={<>
            <button className="text-left font-semibold whitespace-nowrap" onClick={() => onToggleCollapsed(dayKey)}>
              ▶ <span className="text-2xl">{formatDayLabel(day)}</span>
            </button>
            <CollapsedNotesSummary timeblocks={dayTimeblocks} onPatchTimeblockDebounced={onPatchTimeblockDebounced} />
            <CollapsedDayNotes timeblocks={dayTimeblocks} />
          </>}
        />
      ) : (
        <button className="text-left w-full" onClick={() => onToggleCollapsed(dayKey)}>
          <div className="font-semibold">▼ <span className="text-2xl">{formatDayLabel(day)}</span></div>
        </button>
      )}
      {!isCollapsed && zen && (
        <div className="mt-2">
          {sectionViews.map(({ section, isSectionCollapsed, slotsInSection, filledSlots }) => (
            <div key={section.key}>
              <button className="text-left font-semibold" onClick={() => toggleSection(section.key, isSectionCollapsed)}>
                {isSectionCollapsed ? '▶' : '▼'} {section.label}
              </button>
              {(isSectionCollapsed ? filledSlots : slotsInSection).map(slotStart => {
                const slotMs = slotStart.getTime()
                const tb = slotToTimeblock.get(slotMs)
                return (
                  <ZenRow
                    key={slotMs}
                    timeblock={tb}
                    timeLabel={formatHm(slotStart)}
                    ensureTimeblock={async () => tb ?? await onCreateTimeblock({ datetime: slotStart.toISOString(), rayNotes: null, assistantNotes: null, aiNotes: null })}
                    onPatchTimeblockDebounced={onPatchTimeblockDebounced}
                    datetime={slotStart.toISOString()}
                    tagTypes={tagTypes}
                    tagInstancesByType={tagInstancesByTypeForSlot(slotMs)}
                    allTagInstances={allTagInstances}
                    onCreateTagInstance={onCreateTagInstance}
                    onApproveTagInstance={onApproveTagInstance}
                    onPatchTagInstance={onPatchTagInstance}
                    onDeleteTagInstance={onDeleteTagInstance}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}
      {!isCollapsed && !zen && (
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
          {sectionViews.map(({ section, isSectionCollapsed, slotsInSection, filledSlots }) => (
            <tbody key={section.key}>
              <tr>
                <td colSpan={4 + tagTypes.length} className="px-2 py-2">
                  <button className="text-left font-semibold" onClick={() => toggleSection(section.key, isSectionCollapsed)}>
                    {isSectionCollapsed ? '▶' : '▼'} {section.label}
                  </button>
                </td>
              </tr>
              {(isSectionCollapsed ? filledSlots : slotsInSection).map(slotStart => {
                const slotMs = slotStart.getTime()
                const tb = slotToTimeblock.get(slotMs)
                return (
                  <TimeBlockRow
                    key={slotMs}
                    slotStart={slotStart}
                    timeLabel={formatHm(slotStart)}
                    timeblock={tb}
                    tagTypes={tagTypes}
                    tagInstancesByType={tagInstancesByTypeForSlot(slotMs)}
                    allTagInstances={allTagInstances}
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
          ))}
        </table>
      )}
    </div>
  )
})
DaySection.displayName = 'DaySection'

export default DaySection

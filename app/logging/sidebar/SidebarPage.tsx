'use client'
import { useMemo, useEffect, useState } from 'react'
import { FocusedNotesProvider, useFocusedNotes } from '../context/FocusedNotesContext'
import { TagsProvider, useTags } from '../tags/TagsContext'
import { useTagInstances } from '../hooks/useTagInstances'
import { useTimeblocks } from '../hooks/useTimeblocks'
import TagCell from '../tags/TagCell'
import Checklist from '../checklist/Checklist'
import { getCurrentSection } from '../checklist/sectionUtils'
import HeaderTimer from '../HeaderTimer'
import NotesInput from '../editor/NotesInput'

const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

const SidebarPageInner = () => {
  const [currentSection, setCurrentSection] = useState(getCurrentSection())
  const [timeblockOffset, setTimeblockOffset] = useState(0)
  const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  const startDate = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()
  const { tagInstances, load: loadTagInstances, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance } = useTagInstances({ start: startIso, end: endIso })
  const { focusedNoteKeys } = useFocusedNotes()
  const { timeblocks, refreshUnfocused, createTimeblock, patchTimeblockDebounced } = useTimeblocks({ start: startIso, end: endIso })
  const { tags } = useTags()
  const slotSizeMs = 15 * 60 * 1000
  const rangeStartMs = startDate.getTime()
  const rangeEndMs = endDate.getTime()
  const slotsInRange = Math.floor((rangeEndMs - rangeStartMs) / slotSizeMs)
  const currentSlotMs = floorTo15(new Date()).getTime()
  const currentSlotIndex = Math.floor((currentSlotMs - rangeStartMs) / slotSizeMs)
  const selectedSlotIndex = ((currentSlotIndex + timeblockOffset) % slotsInRange + slotsInRange) % slotsInRange
  const selectedSlotMs = rangeStartMs + selectedSlotIndex * slotSizeMs
  const selectedBlockDatetime = useMemo(() => new Date(selectedSlotMs).toISOString(), [selectedSlotMs])
  const selectedTimeblock = useMemo(() =>
    timeblocks.find(tb => floorTo15(new Date(tb.datetime)).getTime() === selectedSlotMs),
  [timeblocks, selectedSlotMs])
  const tagInstancesForCurrentBlock = useMemo(() =>
    tagInstances.filter(ti => floorTo15(new Date(ti.datetime)).getTime() === selectedSlotMs),
  [tagInstances, selectedSlotMs])
  const tagTypes = useMemo(() => {
    const availableTypes = ['Projects', 'Triggers', 'Techniques']
    const filtered = availableTypes.filter(t => tags.some(tag => tag.type === t))
    if (tags.length > 0 && filtered.length === 0) {
      return [...new Set(tags.map(t => t.type))].sort()
    }
    return filtered
  }, [tags])
  const tagInstancesByType = useMemo(() => {
    const byType: Record<string, typeof tagInstancesForCurrentBlock> = {}
    for (const type of tagTypes) byType[type] = []
    for (const ti of tagInstancesForCurrentBlock) {
      const type = ti.tag?.type || tags.find(t => t.id === ti.tagId)?.type || ''
      if (byType[type]) byType[type].push(ti)
    }
    return byType
  }, [tagInstancesForCurrentBlock, tagTypes, tags])
  const ensureSelectedTimeblock = async () => {
    if (selectedTimeblock) return selectedTimeblock
    const created = await createTimeblock({ datetime: selectedBlockDatetime, rayNotes: null, assistantNotes: null, aiNotes: null })
    return created
  }
  useEffect(() => {
    const interval = setInterval(() => setCurrentSection(getCurrentSection()), 30000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const interval = setInterval(() => loadTagInstances(), 5000)
    return () => clearInterval(interval)
  }, [loadTagInstances])
  useEffect(() => {
    const interval = setInterval(() => refreshUnfocused(focusedNoteKeys), 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeys])
  return (
    <div className="w-full flex flex-col gap-4 overflow-y-auto p-4 text-sm md:flex-row">
      <div className="hidden flex-col gap-2 md:flex md:flex-1 min-w-0">
        <div className="font-semibold">Notes for {new Date(selectedBlockDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
        <div className="flex-1 min-h-0">
          <NotesInput
            noteKey={selectedTimeblock ? `${selectedTimeblock.id}:rayNotes` : undefined}
            placeholder="Notes"
            initialValue={selectedTimeblock?.rayNotes || ''}
            externalValue={selectedTimeblock?.rayNotes || ''}
            minHeight={400}
            datetime={selectedBlockDatetime}
            onCreateTagInstance={createTagInstance}
            onDeleteTagInstance={deleteTagInstance}
            onSave={async (content) => {
              const tb = await ensureSelectedTimeblock()
              patchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 0 })
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-1 min-w-0">
        <HeaderTimer />
        <div className="flex flex-col gap-2">
          <div className="font-semibold">Tags for <button type="button" className="px-1 text-white/60 hover:text-white" aria-label="Previous timeblock" onClick={() => setTimeblockOffset(o => o - 1)}>‹</button>{new Date(selectedBlockDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}<button type="button" className="px-1 text-white/60 hover:text-white" aria-label="Next timeblock" onClick={() => setTimeblockOffset(o => o + 1)}>›</button></div>
          {tagTypes.map(type => (
            <div key={type}>
              <div className="text-xs text-white/60 mb-1">{type}</div>
              <TagCell
                type={type}
                tagInstances={tagInstancesByType[type] || []}
                allTagInstances={tagInstances}
                datetime={selectedBlockDatetime}
                onCreateTagInstance={createTagInstance}
                onApproveTagInstance={approveTagInstance}
                onPatchTagInstance={patchTagInstance}
                onDeleteTagInstance={deleteTagInstance}
              />
            </div>
          ))}
        </div>
        <div className="flex-1 min-h-0">
          <Checklist inline fullWidth section={currentSection} />
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const SidebarPage = ({}:{}) => (
  <FocusedNotesProvider>
    <TagsProvider>
      <SidebarPageInner />
    </TagsProvider>
  </FocusedNotesProvider>
)

export default SidebarPage

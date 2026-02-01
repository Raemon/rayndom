'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import DaySection from './DaySection'
import TagSidebar from './TagSidebar'
import { useTimeblocks } from './hooks/useTimeblocks'
import { useTagInstances } from './hooks/useTagInstances'
import { FocusedNotesProvider, useFocusedNotes } from './FocusedNotesContext'
import { TagsProvider } from './TagsContext'
import NotesInput from './NotesInput'
import type { Timeblock } from './types'
import Checklist, { type ChecklistRef } from './Checklist'
import Timer from './Timer'
import PredictTagsButton, { type PredictTagsButtonRef } from './PredictTagsButton'
import { getCurrentSection } from './sectionUtils'

const TimerPageInner = () => {
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({})
  const [isPredicting, setIsPredicting] = useState(false)
  const checklistRef = useRef<ChecklistRef>(null)
  const predictTagsButtonRef = useRef<PredictTagsButtonRef>(null)
  const handleTimerComplete = useCallback(() => {}, [])
  const handlePredictTags = useCallback(() => {
    if (!predictTagsButtonRef.current) {
      console.warn('[TimerPage] handlePredictTags called but predictTagsButtonRef.current is null')
      return
    }
    console.log('[TimerPage] handlePredictTags calling predictTags')
    predictTagsButtonRef.current.predictTags()
  }, [])
  const { focusedNoteKeys } = useFocusedNotes()

  const [currentSection, setCurrentSection] = useState(getCurrentSection())
  useEffect(() => {
    const interval = setInterval(() => setCurrentSection(getCurrentSection()), 30000)
    return () => clearInterval(interval)
  }, [])

  const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  const startDate = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()
  const { timeblocks, createTimeblock, patchTimeblockDebounced, refreshUnfocused, load: loadTimeblocks } = useTimeblocks({ start: startIso, end: endIso })
  const { tagInstances, load: loadTagInstances, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance } = useTagInstances({ start: startIso, end: endIso })

  const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  const currentBlockDatetime = floorTo15(new Date()).toISOString()
  const currentTimeblock = timeblocks.find(tb => new Date(tb.datetime).toISOString() === currentBlockDatetime)
  const ensureCurrentTimeblock = async () => {
    if (currentTimeblock) return currentTimeblock
    const created = await createTimeblock({ datetime: currentBlockDatetime, rayNotes: null, assistantNotes: null, aiNotes: null })
    return created as Timeblock
  }

  // Poll database every 5 seconds to refresh unfocused notes, tag instances, and checklist
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnfocused(focusedNoteKeys)
      loadTagInstances()
      checklistRef.current?.refreshItems()
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeys, loadTagInstances])

  return (
    <div className="p-4 text-sm">
      <div className="mb-4">
        <Timer
          onTimerComplete={handleTimerComplete}
          onPredictTags={handlePredictTags}
          checklistRef={checklistRef}
          isPredicting={isPredicting}
        />
        <div className="flex items-center gap-2 mb-2">
          <PredictTagsButton ref={predictTagsButtonRef} loadTagInstances={loadTagInstances} loadTimeblocks={loadTimeblocks} onIsPredictingChange={setIsPredicting} />
        </div>
        <NotesInput
          noteKey={currentTimeblock ? `${currentTimeblock.id}:aiNotes` : undefined}
          placeholder="AI Notes"
          initialValue={currentTimeblock?.aiNotes || ''}
          externalValue={currentTimeblock?.aiNotes || ''}
          onSave={async (content) => {
            const tb = await ensureCurrentTimeblock()
            patchTimeblockDebounced({ id: tb.id, aiNotes: content, debounceMs: 0 })
          }}
        />
      </div>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {Array.from({ length: 14 }).map((_, i) => {
            const day = new Date()
            day.setDate(day.getDate() - i)
            day.setHours(0, 0, 0, 0)
            const key = day.toISOString().slice(0, 10)
            const isCollapsed = collapsedDays[key] ?? (i !== 0)
            return (
              <DaySection
                key={key}
                day={day}
                isCollapsed={isCollapsed}
                onToggleCollapsed={() => setCollapsedDays(prev => ({ ...prev, [key]: !(prev[key] ?? (i !== 0)) }))}
                timeblocks={timeblocks}
                tagInstances={tagInstances}
                onCreateTimeblock={async (args) => {
                  const tb = await createTimeblock(args)
                  return tb as Timeblock
                }}
                onPatchTimeblockDebounced={patchTimeblockDebounced}
                onCreateTagInstance={createTagInstance}
                onApproveTagInstance={approveTagInstance}
                onPatchTagInstance={patchTagInstance}
                onDeleteTagInstance={deleteTagInstance}
              />
            )
          })}
        </div>
        <div className="w-72">
          <TagSidebar tagInstances={tagInstances} />
        </div>
      </div>
      <Checklist ref={checklistRef} section={currentSection} />
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const TimerPage = ({}:{}) => (
  <FocusedNotesProvider>
    <TagsProvider>
      <TimerPageInner />
    </TagsProvider>
  </FocusedNotesProvider>
)

export default TimerPage

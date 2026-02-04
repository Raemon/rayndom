'use client'
import { useEffect, useRef, useMemo } from 'react'
import { useTimeblocks } from '../hooks/useTimeblocks'
import { useTagInstances } from '../hooks/useTagInstances'
import { FocusedNotesProvider, useFocusedNotes } from '../context/FocusedNotesContext'
import { TagsProvider, useTags } from '../tags/TagsContext'
import MarkdownContent from '../../common/MarkdownContent'
import Checklist, { type ChecklistRef } from '../checklist/Checklist'
import ZenRow from '../zen/ZenRow'
import type { Timeblock } from '../types'
import Timer from './Timer'
import RunAiCommandButton from '../zen/RunAiCommandButton'
import { useAiTags } from '../hooks/useAiTags'

const LoggingZenInner = () => {
  const { isPredicting, predictTags } = useAiTags()
  const { focusedNoteKeys } = useFocusedNotes()
  const checklistRef = useRef<ChecklistRef>(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const startIso = today.toISOString()
  const endIso = tomorrow.toISOString()
  const { timeblocks, createTimeblock, patchTimeblockDebounced, refreshUnfocused } = useTimeblocks({ start: startIso, end: endIso })
  const { tagInstances, load: loadTagInstances, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance } = useTagInstances({ start: startIso, end: endIso })
  const { tags } = useTags()
  const tagTypes = useMemo(() => {
    const availableTypes = ['Projects', 'Triggers','Techniques']
    const filtered = availableTypes.filter(t => tags.some(tag => tag.type === t))
    if (tags.length > 0 && filtered.length === 0) {
      console.warn('No tags match expected types. Available tag types:', [...new Set(tags.map(t => t.type))])
    }
    return filtered
  }, [tags])

  const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  const currentBlockDatetime = floorTo15(new Date()).toISOString()
  const currentTimeblock = timeblocks.find(tb => new Date(tb.datetime).toISOString() === currentBlockDatetime)
  const ensureCurrentTimeblock = async () => {
    if (currentTimeblock) return currentTimeblock
    const created = await createTimeblock({ datetime: currentBlockDatetime, rayNotes: null, assistantNotes: null, aiNotes: null })
    return created as Timeblock
  }

  // Previous timestamp (15 min before current)
  const prevBlockDatetime = new Date(new Date(currentBlockDatetime).getTime() - 15 * 60 * 1000).toISOString()
  const previousTimeblock = timeblocks.find(tb => new Date(tb.datetime).toISOString() === prevBlockDatetime)

  // All other earlier timeblocks today with notes (excluding the previous one)
  const otherBlocksWithNotes = timeblocks
    .filter(tb => {
      const tbTime = new Date(tb.datetime).toISOString()
      return tbTime < currentBlockDatetime && tbTime !== prevBlockDatetime && (tb.rayNotes || tb.assistantNotes || tb.aiNotes)
    })
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

  // Poll database every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnfocused(focusedNoteKeys)
      loadTagInstances()
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeys, loadTagInstances])

  const getTagInstancesByType = (datetime: string) => {
    const slotMs = floorTo15(new Date(datetime)).getTime()
    const byType: Record<string, typeof tagInstances> = {}
    for (const type of tagTypes) byType[type] = []
    for (const tagInstance of tagInstances) {
      const tagSlotMs = floorTo15(new Date(tagInstance.datetime)).getTime()
      if (tagSlotMs !== slotMs) continue
      const type = tagInstance.tag?.type || tags.find(t => t.id === tagInstance.tagId)?.type || ''
      if (byType[type]) byType[type].push(tagInstance)
    }
    return byType
  }

  const currentTime = new Date(currentBlockDatetime)
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const handleRunAiCommand = async (datetime: string) => {
    await predictTags({ datetime })
    refreshUnfocused(new Set())
  }

  return (
    <div className="flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto' }} className="p-2 text-sm">
        <Timer checklistRef={checklistRef} isPredicting={isPredicting} onRunAiCommand={handleRunAiCommand} />
        <RunAiCommandButton datetime={currentBlockDatetime} onComplete={() => refreshUnfocused(new Set())} />
        <MarkdownContent html={currentTimeblock?.aiNotes || ''} />
      </div>
      <div style={{ flex: 1, overflow: 'auto' }} className="p-2">
        <ZenRow
          timeblock={currentTimeblock}
          timeLabel={currentTimeStr}
          ensureTimeblock={ensureCurrentTimeblock}
          onPatchTimeblockDebounced={patchTimeblockDebounced}
          minHeight="calc(100vh - 32px)"
          datetime={currentBlockDatetime}
          tagTypes={tagTypes}
          tagInstancesByType={getTagInstancesByType(currentBlockDatetime)}
          allTagInstances={tagInstances}
          onCreateTagInstance={createTagInstance}
          onApproveTagInstance={approveTagInstance}
          onPatchTagInstance={patchTagInstance}
          onDeleteTagInstance={deleteTagInstance}
        />
        {previousTimeblock && (
          <ZenRow
            timeblock={previousTimeblock}
            timeLabel={new Date(prevBlockDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            ensureTimeblock={async () => previousTimeblock}
            onPatchTimeblockDebounced={patchTimeblockDebounced}
            datetime={prevBlockDatetime}
            tagTypes={tagTypes}
            tagInstancesByType={getTagInstancesByType(prevBlockDatetime)}
            allTagInstances={tagInstances}
            onCreateTagInstance={createTagInstance}
            onApproveTagInstance={approveTagInstance}
            onPatchTagInstance={patchTagInstance}
            onDeleteTagInstance={deleteTagInstance}
          />
        )}
        {otherBlocksWithNotes.map(tb => {
          const time = new Date(tb.datetime)
          const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          return (
            <ZenRow
              key={tb.id}
              timeblock={tb}
              timeLabel={timeStr}
              ensureTimeblock={async () => tb}
              onPatchTimeblockDebounced={patchTimeblockDebounced}
              datetime={tb.datetime}
              tagTypes={tagTypes}
              tagInstancesByType={getTagInstancesByType(tb.datetime)}
              allTagInstances={tagInstances}
              onCreateTagInstance={createTagInstance}
              onApproveTagInstance={approveTagInstance}
              onPatchTagInstance={patchTagInstance}
              onDeleteTagInstance={deleteTagInstance}
            />
          )
        })}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }} className="p-2">
        <Checklist ref={checklistRef} inline />
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const LoggingZen = ({}:{}) => (
  <FocusedNotesProvider>
    <TagsProvider>
      <LoggingZenInner />
    </TagsProvider>
  </FocusedNotesProvider>
)

export default LoggingZen

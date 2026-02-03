'use client'
import { useEffect } from 'react'
import { useTimeblocks } from '../hooks/useTimeblocks'
import { FocusedNotesProvider, useFocusedNotes } from '../context/FocusedNotesContext'
import { TagsProvider } from '../tags/TagsContext'
import NotesInput from '../editor/NotesInput'
import type { Timeblock } from '../types'

const LoggingZenInner = () => {
  const { focusedNoteKeys } = useFocusedNotes()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const startIso = today.toISOString()
  const endIso = tomorrow.toISOString()
  const { timeblocks, createTimeblock, patchTimeblockDebounced, refreshUnfocused } = useTimeblocks({ start: startIso, end: endIso })

  const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  const currentBlockDatetime = floorTo15(new Date()).toISOString()
  const currentTimeblock = timeblocks.find(tb => new Date(tb.datetime).toISOString() === currentBlockDatetime)
  const ensureCurrentTimeblock = async () => {
    if (currentTimeblock) return currentTimeblock
    const created = await createTimeblock({ datetime: currentBlockDatetime, rayNotes: null, assistantNotes: null, aiNotes: null })
    return created as Timeblock
  }

  // Earlier timeblocks today with content
  const earlierBlocksWithContent = timeblocks
    .filter(tb => {
      const tbTime = new Date(tb.datetime).toISOString()
      return tbTime < currentBlockDatetime && (tb.rayNotes || tb.assistantNotes || tb.aiNotes)
    })
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

  // Poll database every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnfocused(focusedNoteKeys)
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeys])

  return (
    <div className="p-4 flex flex-col items-center">
      <div style={{ width: 640, height: '90vh' }}>
        <NotesInput
          noteKey={currentTimeblock ? `${currentTimeblock.id}:rayNotes` : undefined}
          placeholder="Current block..."
          initialValue={currentTimeblock?.rayNotes || ''}
          externalValue={currentTimeblock?.rayNotes || ''}
          minHeight={window?.innerHeight ? window.innerHeight * 0.9 - 32 : 600}
          onSave={async (content) => {
            const tb = await ensureCurrentTimeblock()
            patchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 300 })
          }}
        />
      </div>
      {earlierBlocksWithContent.map(tb => {
        const time = new Date(tb.datetime)
        const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        return (
          <div key={tb.id} style={{ width: 640 }} className="mt-4">
            <div className="text-xs text-gray-500 mb-1">{timeStr}</div>
            <NotesInput
              noteKey={`${tb.id}:rayNotes`}
              placeholder=""
              initialValue={tb.rayNotes || ''}
              externalValue={tb.rayNotes || ''}
              onSave={(content) => {
                patchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 300 })
              }}
            />
          </div>
        )
      })}
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

'use client'
import { useEffect } from 'react'
import { useTimeblocks } from '../hooks/useTimeblocks'
import { FocusedNotesProvider, useFocusedNotes } from '../context/FocusedNotesContext'
import { TagsProvider } from '../tags/TagsContext'
import MarkdownContent from '../../common/MarkdownContent'
import Checklist from '../checklist/Checklist'
import ZenRow from '../zen/ZenRow'
import RunAIButton from '../zen/RunAIButton'
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
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeys])

  const currentTime = new Date(currentBlockDatetime)
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto' }} className="p-2">
        <RunAIButton ensureTimeblock={ensureCurrentTimeblock} onComplete={() => refreshUnfocused(new Set())} />
        <MarkdownContent html={currentTimeblock?.aiNotes || ''} />
      </div>
      <div style={{ flex: 1, overflow: 'auto' }} className="p-2">
        <ZenRow
          timeblock={currentTimeblock}
          timeLabel={currentTimeStr}
          ensureTimeblock={ensureCurrentTimeblock}
          onPatchTimeblockDebounced={patchTimeblockDebounced}
          minHeight="calc(100vh - 32px)"
        />
        {previousTimeblock && (
          <ZenRow
            timeblock={previousTimeblock}
            timeLabel={new Date(prevBlockDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            ensureTimeblock={async () => previousTimeblock}
            onPatchTimeblockDebounced={patchTimeblockDebounced}
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
            />
          )
        })}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }} className="p-2">
        <Checklist inline />
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

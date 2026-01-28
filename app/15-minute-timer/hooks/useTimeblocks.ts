import { useEffect, useRef, useState, useCallback } from 'react'
import type { Timeblock } from '../types'

export const useTimeblocks = ({ start, end, autoLoad=true }:{ start: string, end: string, autoLoad?: boolean }) => {
  const [timeblocks, setTimeblocks] = useState<Timeblock[]>([])
  const debouncersRef = useRef<Record<number, ReturnType<typeof setTimeout> | null>>({})

  const load = async () => {
    const res = await fetch(`/api/timer/timeblocks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
    const json = await res.json()
    setTimeblocks(json.timeblocks || [])
  }

  // Fetch fresh data and selectively update timeblocks, skipping focused note fields
  const refreshUnfocused = useCallback(async (focusedNoteKeys: Set<string>) => {
    const res = await fetch(`/api/timer/timeblocks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
    const json = await res.json()
    const freshTimeblocks: Timeblock[] = json.timeblocks || []
    setTimeblocks(prev => {
      const freshById = new Map(freshTimeblocks.map(tb => [tb.id, tb]))
      const existingIds = new Set(prev.map(tb => tb.id))
      // Update existing timeblocks, add new ones
      const updated = prev.map(tb => {
        const fresh = freshById.get(tb.id)
        if (!fresh) return tb
        const rayNotesFocused = focusedNoteKeys.has(`${tb.id}:rayNotes`)
        const assistantNotesFocused = focusedNoteKeys.has(`${tb.id}:assistantNotes`)
        const aiNotesFocused = focusedNoteKeys.has(`${tb.id}:aiNotes`)
        return {
          ...tb,
          rayNotes: rayNotesFocused ? tb.rayNotes : fresh.rayNotes,
          assistantNotes: assistantNotesFocused ? tb.assistantNotes : fresh.assistantNotes,
          aiNotes: aiNotesFocused ? tb.aiNotes : fresh.aiNotes,
          orientingBlock: fresh.orientingBlock,
        }
      })
      // Add any new timeblocks that weren't in prev
      const newTimeblocks = freshTimeblocks.filter(tb => !existingIds.has(tb.id))
      return [...updated, ...newTimeblocks]
    })
  }, [start, end])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (autoLoad) load() }, [start, end])

  const createTimeblock = async ({ datetime, rayNotes=null, assistantNotes=null, aiNotes=null, orientingBlock=false }:{ datetime: string, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, orientingBlock?: boolean }) => {
    const optimistic: Timeblock = { id: -Date.now(), datetime, rayNotes, assistantNotes, aiNotes, orientingBlock }
    setTimeblocks(prev => [...prev, optimistic])
    const res = await fetch('/api/timer/timeblocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datetime, rayNotes, assistantNotes, aiNotes, orientingBlock }) })
    const json = await res.json()
    if (json.timeblock) setTimeblocks(prev => prev.map(tb => tb.id === optimistic.id ? json.timeblock : tb))
    return json.timeblock as Timeblock
  }

  const patchTimeblock = async ({ id, rayNotes, assistantNotes, aiNotes, orientingBlock }:{ id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, orientingBlock?: boolean }) => {
    setTimeblocks(prev => prev.map(tb => tb.id === id ? { ...tb, rayNotes: rayNotes ?? tb.rayNotes, assistantNotes: assistantNotes ?? tb.assistantNotes, aiNotes: aiNotes ?? tb.aiNotes, orientingBlock: orientingBlock ?? tb.orientingBlock } : tb))
    const res = await fetch('/api/timer/timeblocks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, rayNotes, assistantNotes, aiNotes, orientingBlock }) })
    const json = await res.json()
    if (json.timeblock) setTimeblocks(prev => prev.map(tb => tb.id === id ? json.timeblock : tb))
  }

  const patchTimeblockDebounced = ({ id, rayNotes, assistantNotes, aiNotes, orientingBlock, debounceMs=500 }:{ id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, orientingBlock?: boolean, debounceMs?: number }) => {
    if (debouncersRef.current[id]) clearTimeout(debouncersRef.current[id])
    debouncersRef.current[id] = setTimeout(() => patchTimeblock({ id, rayNotes, assistantNotes, aiNotes, orientingBlock }), debounceMs)
  }

  return { timeblocks, setTimeblocks, load, refreshUnfocused, createTimeblock, patchTimeblock, patchTimeblockDebounced }
}

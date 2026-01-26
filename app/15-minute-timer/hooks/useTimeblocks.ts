import { useEffect, useRef, useState } from 'react'
import type { Timeblock } from '../types'

export const useTimeblocks = ({ start, end, autoLoad=true }:{ start: string, end: string, autoLoad?: boolean }) => {
  const [timeblocks, setTimeblocks] = useState<Timeblock[]>([])
  const debouncersRef = useRef<Record<number, ReturnType<typeof setTimeout> | null>>({})

  const load = async () => {
    const res = await fetch(`/api/timer/timeblocks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
    const json = await res.json()
    setTimeblocks(json.timeblocks || [])
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (autoLoad) load() }, [start, end])

  const createTimeblock = async ({ datetime, rayNotes=null, assistantNotes=null }:{ datetime: string, rayNotes?: string | null, assistantNotes?: string | null }) => {
    const optimistic: Timeblock = { id: -Date.now(), datetime, rayNotes, assistantNotes }
    setTimeblocks(prev => [...prev, optimistic])
    const res = await fetch('/api/timer/timeblocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datetime, rayNotes, assistantNotes }) })
    const json = await res.json()
    if (json.timeblock) setTimeblocks(prev => prev.map(tb => tb.id === optimistic.id ? json.timeblock : tb))
    return json.timeblock as Timeblock
  }

  const patchTimeblock = async ({ id, rayNotes, assistantNotes }:{ id: number, rayNotes?: string | null, assistantNotes?: string | null }) => {
    setTimeblocks(prev => prev.map(tb => tb.id === id ? { ...tb, rayNotes: rayNotes ?? tb.rayNotes, assistantNotes: assistantNotes ?? tb.assistantNotes } : tb))
    const res = await fetch('/api/timer/timeblocks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, rayNotes, assistantNotes }) })
    const json = await res.json()
    if (json.timeblock) setTimeblocks(prev => prev.map(tb => tb.id === id ? json.timeblock : tb))
  }

  const patchTimeblockDebounced = ({ id, rayNotes, assistantNotes, debounceMs=500 }:{ id: number, rayNotes?: string | null, assistantNotes?: string | null, debounceMs?: number }) => {
    if (debouncersRef.current[id]) clearTimeout(debouncersRef.current[id])
    debouncersRef.current[id] = setTimeout(() => patchTimeblock({ id, rayNotes, assistantNotes }), debounceMs)
  }

  return { timeblocks, setTimeblocks, load, createTimeblock, patchTimeblock, patchTimeblockDebounced }
}

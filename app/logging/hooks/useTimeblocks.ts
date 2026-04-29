import { useEffect, useRef, useState, useCallback } from 'react'
import type { Timeblock } from '../types'
import { getApiErrorMessage } from '../lib/optimisticApi'
import { runOptimisticMutation } from '../lib/optimisticMutation'

export const useTimeblocks = ({ start, end, autoLoad=true }:{ start: string, end: string, autoLoad?: boolean }) => {
  const [timeblocks, setTimeblocks] = useState<Timeblock[]>([])
  const [isLoading, setIsLoading] = useState(autoLoad)
  const debouncersRef = useRef<Record<number, ReturnType<typeof setTimeout> | null>>({})

  const load = async () => {
    const res = await fetch(`/api/timer/timeblocks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
    const json = await res.json()
    const freshTimeblocks: Timeblock[] = json.timeblocks || []
    setTimeblocks(prev => {
      const startDate = new Date(start)
      const historicalTimeblocks = prev.filter(tb => new Date(tb.datetime) < startDate)
      return [...historicalTimeblocks, ...freshTimeblocks]
    })
  }

  // Fetch fresh data and selectively update timeblocks, skipping focused note fields
  const refreshUnfocused = useCallback(async (focusedNoteKeys: Set<string>) => {
    const res = await fetch(`/api/timer/timeblocks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
    const json = await res.json()
    const freshTimeblocks: Timeblock[] = json.timeblocks || []
    setTimeblocks(prev => {
      const freshById = new Map(freshTimeblocks.map(tb => [tb.id, tb]))
      const existingIds = new Set(prev.map(tb => tb.id))
      const newTimeblocks = freshTimeblocks.filter(tb => !existingIds.has(tb.id))
      // Update existing timeblocks, preserving identity when unchanged
      const updated = prev.map(tb => {
        const fresh = freshById.get(tb.id)
        if (!fresh) return tb
        const rayNotesFocused = focusedNoteKeys.has(`${tb.id}:rayNotes`)
        const assistantNotesFocused = focusedNoteKeys.has(`${tb.id}:assistantNotes`)
        const aiNotesFocused = focusedNoteKeys.has(`${tb.id}:aiNotes`)
        const newRayNotes = rayNotesFocused ? tb.rayNotes : fresh.rayNotes
        const newAssistantNotes = assistantNotesFocused ? tb.assistantNotes : fresh.assistantNotes
        const newAiNotes = aiNotesFocused ? tb.aiNotes : fresh.aiNotes
        if (newRayNotes === tb.rayNotes && newAssistantNotes === tb.assistantNotes && newAiNotes === tb.aiNotes) return tb
        return { ...tb, rayNotes: newRayNotes, assistantNotes: newAssistantNotes, aiNotes: newAiNotes }
      })
      // Bail out if nothing actually changed to avoid unnecessary re-renders
      if (newTimeblocks.length === 0 && updated.every((tb, i) => tb === prev[i])) return prev
      return [...updated, ...newTimeblocks]
    })
  }, [start, end])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!autoLoad) return
    const loadAll = async () => {
      const primaryRes = await fetch(`/api/timer/timeblocks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
      const primaryJson = await primaryRes.json()
      setTimeblocks(primaryJson.timeblocks || [])
      const historicalStart = encodeURIComponent(new Date(2000, 0, 1).toISOString())
      const historicalEnd = encodeURIComponent(start)
      const historicalRes = await fetch(`/api/timer/timeblocks?start=${historicalStart}&end=${historicalEnd}`)
      const historicalJson = await historicalRes.json()
      const historicalTimeblocks: Timeblock[] = historicalJson.timeblocks || []
      if (historicalTimeblocks.length > 0) {
        setTimeblocks(prev => [...historicalTimeblocks, ...prev])
      }
    }
    loadAll().finally(() => setIsLoading(false))
  }, [start, end])

  const createTimeblock = async ({ datetime, rayNotes=null, assistantNotes=null, aiNotes=null }:{ datetime: string, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => {
    const optimistic: Timeblock = { id: -Date.now(), datetime, rayNotes, assistantNotes, aiNotes }
    const timeblock = await runOptimisticMutation({
      applyOptimistic: () => {
        setTimeblocks(prev => [...prev, optimistic])
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/timer/timeblocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datetime, rayNotes, assistantNotes, aiNotes }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to create timeblock (${res.status})`))
        return (json as { timeblock?: Timeblock }).timeblock as Timeblock
      },
      commit: (created) => {
        if (created) setTimeblocks(prev => prev.map(tb => tb.id === optimistic.id ? created : tb))
      },
      rollback: () => {
        setTimeblocks(prev => prev.filter(tb => tb.id !== optimistic.id))
      },
    })
    return timeblock
  }

  const patchTimeblock = async ({ id, rayNotes, assistantNotes, aiNotes }:{ id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => {
    const previousTimeblock = timeblocks.find(tb => tb.id === id)
    if (!previousTimeblock) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setTimeblocks(prev => prev.map(tb => tb.id === id ? { ...tb, rayNotes: rayNotes ?? tb.rayNotes, assistantNotes: assistantNotes ?? tb.assistantNotes, aiNotes: aiNotes ?? tb.aiNotes } : tb))
        return previousTimeblock
      },
      request: async () => {
        const res = await fetch('/api/timer/timeblocks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, rayNotes, assistantNotes, aiNotes }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to update timeblock (${res.status})`))
        return json as { timeblock?: Timeblock }
      },
      commit: (json) => {
        if (json.timeblock) setTimeblocks(prev => prev.map(tb => tb.id === id ? json.timeblock as Timeblock : tb))
      },
      rollback: (previous) => {
        setTimeblocks(prev => prev.map(tb => tb.id === id ? previous : tb))
      },
      rethrow: false,
    })
  }

  const patchTimeblockDebounced = ({ id, rayNotes, assistantNotes, aiNotes, debounceMs=500 }:{ id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, debounceMs?: number }) => {
    if (debouncersRef.current[id]) clearTimeout(debouncersRef.current[id])
    debouncersRef.current[id] = setTimeout(() => patchTimeblock({ id, rayNotes, assistantNotes, aiNotes }), debounceMs)
  }

  return { timeblocks, setTimeblocks, isLoading, load, refreshUnfocused, createTimeblock, patchTimeblock, patchTimeblockDebounced }
}

import { useCallback, useEffect, useState } from 'react'
import type { TagInstance } from '../types'
import { getApiErrorMessage } from '../lib/optimisticApi'
import { runOptimisticMutation } from '../lib/optimisticMutation'

export const useTagInstances = ({ start, end, autoLoad=true }:{ start: string, end: string, autoLoad?: boolean }) => {
  const [tagInstances, setTagInstances] = useState<TagInstance[]>([])

  const load = useCallback(async () => {
    const res = await fetch(`/api/timer/tag-instances?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
    const json = await res.json()
    const serverInstances = json.tagInstances || []
    // Preserve optimistic entries (negative IDs) that haven't been resolved yet
    setTagInstances(prev => {
      const pendingOptimistic = prev.filter(ti => ti.id < 0)
      return [...serverInstances, ...pendingOptimistic]
    })
  }, [start, end])

  // eslint-disable-next-line react-hooks/set-state-in-effect 
  useEffect(() => { if (autoLoad) load() }, [start, end])

  const createTagInstance = async ({ tagId, datetime, llmPredicted=false, approved=true }:{ tagId: number, datetime: string, llmPredicted?: boolean, approved?: boolean }) => {
    const optimistic: TagInstance = { id: -Date.now(), tagId, datetime, llmPredicted, approved }
    const tagInstance = await runOptimisticMutation({
      applyOptimistic: () => {
        setTagInstances(prev => [...prev, optimistic])
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/timer/tag-instances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagId, datetime, llmPredicted, approved }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to create tag instance (${res.status})`))
        return (json as { tagInstance?: TagInstance }).tagInstance as TagInstance
      },
      commit: (created) => {
        if (created) setTagInstances(prev => prev.map(ti => ti.id === optimistic.id ? created : ti))
      },
      rollback: () => {
        setTagInstances(prev => prev.filter(ti => ti.id !== optimistic.id))
      },
    })
    return tagInstance
  }

  const approveTagInstance = async ({ id }:{ id: number }) => {
    const previousTagInstance = tagInstances.find(ti => ti.id === id)
    if (!previousTagInstance) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setTagInstances(prev => prev.map(ti => ti.id === id ? { ...ti, approved: true } : ti))
        return previousTagInstance
      },
      request: async () => {
        const res = await fetch('/api/timer/tag-instances', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved: true }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to approve tag instance (${res.status})`))
        return json as { tagInstance?: TagInstance }
      },
      commit: (json) => {
        if (json.tagInstance) setTagInstances(prev => prev.map(ti => ti.id === id ? json.tagInstance as TagInstance : ti))
      },
      rollback: (previous) => {
        setTagInstances(prev => prev.map(ti => ti.id === id ? previous : ti))
      },
      rethrow: false,
    })
  }

  const patchTagInstance = async ({ id, useful, antiUseful }:{ id: number, useful?: boolean, antiUseful?: boolean }) => {
    const previousTagInstance = tagInstances.find(ti => ti.id === id)
    if (!previousTagInstance) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setTagInstances(prev => prev.map(ti => ti.id === id ? { ...ti, useful: useful ?? ti.useful, antiUseful: antiUseful ?? ti.antiUseful } : ti))
        return previousTagInstance
      },
      request: async () => {
        const res = await fetch('/api/timer/tag-instances', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, useful, antiUseful }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to update tag instance (${res.status})`))
        return json as { tagInstance?: TagInstance }
      },
      commit: (json) => {
        if (json.tagInstance) setTagInstances(prev => prev.map(ti => ti.id === id ? json.tagInstance as TagInstance : ti))
      },
      rollback: (previous) => {
        setTagInstances(prev => prev.map(ti => ti.id === id ? previous : ti))
      },
      rethrow: false,
    })
  }

  const deleteTagInstance = async ({ id }:{ id: number }) => {
    const previousTagInstanceIndex = tagInstances.findIndex(ti => ti.id === id)
    const previousTagInstance = tagInstances.find(ti => ti.id === id)
    if (!previousTagInstance) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setTagInstances(prev => prev.filter(ti => ti.id !== id))
        return { previousTagInstanceIndex, previousTagInstance }
      },
      request: async () => {
        const res = await fetch(`/api/timer/tag-instances?id=${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to delete tag instance (${res.status})`))
        }
        return true
      },
      rollback: ({ previousTagInstanceIndex, previousTagInstance }) => {
        setTagInstances(prev => {
          if (prev.some(ti => ti.id === previousTagInstance.id)) return prev
          const next = [...prev]
          const insertIndex = previousTagInstanceIndex >= 0 && previousTagInstanceIndex <= next.length ? previousTagInstanceIndex : next.length
          next.splice(insertIndex, 0, previousTagInstance)
          return next
        })
      },
      rethrow: false,
    })
  }

  return { tagInstances, setTagInstances, load, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance }
}

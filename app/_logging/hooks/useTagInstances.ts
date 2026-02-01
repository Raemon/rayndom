import { useCallback, useEffect, useState } from 'react'
import type { TagInstance } from '../types'

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
    setTagInstances(prev => [...prev, optimistic])
    const res = await fetch('/api/timer/tag-instances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagId, datetime, llmPredicted, approved }) })
    const json = await res.json()
    if (json.tagInstance) setTagInstances(prev => prev.map(ti => ti.id === optimistic.id ? json.tagInstance : ti))
    return json.tagInstance as TagInstance
  }

  const approveTagInstance = async ({ id }:{ id: number }) => {
    setTagInstances(prev => prev.map(ti => ti.id === id ? { ...ti, approved: true } : ti))
    const res = await fetch('/api/timer/tag-instances', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved: true }) })
    const json = await res.json()
    if (json.tagInstance) setTagInstances(prev => prev.map(ti => ti.id === id ? json.tagInstance : ti))
  }

  const patchTagInstance = async ({ id, useful, antiUseful }:{ id: number, useful?: boolean, antiUseful?: boolean }) => {
    setTagInstances(prev => prev.map(ti => ti.id === id ? { ...ti, useful: useful ?? ti.useful, antiUseful: antiUseful ?? ti.antiUseful } : ti))
    const res = await fetch('/api/timer/tag-instances', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, useful, antiUseful }) })
    const json = await res.json()
    if (json.tagInstance) setTagInstances(prev => prev.map(ti => ti.id === id ? json.tagInstance : ti))
  }

  const deleteTagInstance = async ({ id }:{ id: number }) => {
    setTagInstances(prev => prev.filter(ti => ti.id !== id))
    await fetch(`/api/timer/tag-instances?id=${id}`, { method: 'DELETE' })
  }

  return { tagInstances, setTagInstances, load, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance }
}

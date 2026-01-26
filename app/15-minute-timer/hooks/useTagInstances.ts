import { useEffect, useState } from 'react'
import type { TagInstance } from '../types'

export const useTagInstances = ({ start, end, autoLoad=true }:{ start: string, end: string, autoLoad?: boolean }) => {
  const [tagInstances, setTagInstances] = useState<TagInstance[]>([])

  const load = async () => {
    const res = await fetch(`/api/timer/tag-instances?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
    const json = await res.json()
    setTagInstances(json.tagInstances || [])
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (autoLoad) load() }, [start, end])

  const createTagInstance = async ({ tagId, datetime }:{ tagId: number, datetime: string }) => {
    const optimistic: TagInstance = { id: -Date.now(), tagId, datetime }
    setTagInstances(prev => [...prev, optimistic])
    const res = await fetch('/api/timer/tag-instances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagId, datetime }) })
    const json = await res.json()
    if (json.tagInstance) setTagInstances(prev => prev.map(ti => ti.id === optimistic.id ? json.tagInstance : ti))
    return json.tagInstance as TagInstance
  }

  const deleteTagInstance = async ({ id }:{ id: number }) => {
    setTagInstances(prev => prev.filter(ti => ti.id !== id))
    await fetch(`/api/timer/tag-instances?id=${id}`, { method: 'DELETE' })
  }

  return { tagInstances, setTagInstances, load, createTagInstance, deleteTagInstance }
}

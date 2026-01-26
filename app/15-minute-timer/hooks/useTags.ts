import { useEffect, useState } from 'react'
import type { Tag } from '../types'

export const useTags = ({ autoLoad=true }:{ autoLoad?: boolean } = {}) => {
  const [tags, setTags] = useState<Tag[]>([])

  const load = async () => {
    const res = await fetch('/api/timer/tags')
    const json = await res.json()
    setTags(json.tags || [])
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (autoLoad) load() }, [])

  const createTag = async ({ name, type }:{ name: string, type: string }) => {
    const optimistic: Tag = { id: -Date.now(), name, type }
    setTags(prev => [optimistic, ...prev])
    const res = await fetch('/api/timer/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) })
    const json = await res.json()
    if (json.tag) setTags(prev => prev.map(t => t.id === optimistic.id ? json.tag : t))
    return json.tag as Tag
  }

  const updateTag = async ({ id, name, type }:{ id: number, name?: string, type?: string }) => {
    const prevTag = tags.find(t => t.id === id)
    if (!prevTag) return
    setTags(prev => prev.map(t => t.id === id ? { ...t, name: name ?? t.name, type: type ?? t.type } : t))
    const res = await fetch('/api/timer/tags', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, type }) })
    const json = await res.json()
    if (json.tag) setTags(prev => prev.map(t => t.id === id ? json.tag : t))
  }

  const deleteTag = async ({ id }:{ id: number }) => {
    setTags(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/timer/tags?id=${id}`, { method: 'DELETE' })
  }

  return { tags, setTags, load, createTag, updateTag, deleteTag }
}

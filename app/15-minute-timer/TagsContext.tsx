'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Tag } from './types'

type TagsContextType = {
  tags: Tag[]
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>
  load: () => Promise<void>
  createTag: (args: { name: string, type: string }) => Promise<Tag>
  updateTag: (args: { id: number, name?: string, type?: string }) => Promise<void>
  deleteTag: (args: { id: number }) => Promise<void>
}

const TagsContext = createContext<TagsContextType | null>(null)

export const TagsProvider = ({ children }:{ children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>([])

  const load = useCallback(async () => {
    const res = await fetch('/api/timer/tags')
    const json = await res.json()
    setTags(json.tags || [])
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const createTag = useCallback(async ({ name, type }:{ name: string, type: string }) => {
    const optimistic: Tag = { id: -Date.now(), name, type }
    setTags(prev => [optimistic, ...prev])
    const res = await fetch('/api/timer/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) })
    const json = await res.json()
    if (json.tag) setTags(prev => prev.map(t => t.id === optimistic.id ? json.tag : t))
    return json.tag as Tag
  }, [])

  const updateTag = useCallback(async ({ id, name, type }:{ id: number, name?: string, type?: string }) => {
    setTags(prev => prev.map(t => t.id === id ? { ...t, name: name ?? t.name, type: type ?? t.type } : t))
    const res = await fetch('/api/timer/tags', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, type }) })
    const json = await res.json()
    if (json.tag) setTags(prev => prev.map(t => t.id === id ? json.tag : t))
  }, [])

  const deleteTag = useCallback(async ({ id }:{ id: number }) => {
    setTags(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/timer/tags?id=${id}`, { method: 'DELETE' })
  }, [])

  return (
    <TagsContext.Provider value={{ tags, setTags, load, createTag, updateTag, deleteTag }}>
      {children}
    </TagsContext.Provider>
  )
}

export const useTags = () => {
  const ctx = useContext(TagsContext)
  if (!ctx) throw new Error('useTags must be used within TagsProvider')
  return ctx
}

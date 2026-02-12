'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Tag } from '../types'

type TagsContextType = {
  tags: Tag[]
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>
  load: () => Promise<void>
  createTag: (args: { name: string, type: string }) => Promise<Tag>
  updateTag: (args: { id: number, name?: string, type?: string, description?: string | null, parentTagId?: number | null, suggestedTagIds?: number[] | null, noAiSuggest?: boolean }) => Promise<void>
  deleteTag: (args: { id: number }) => Promise<void>
}

const TagsContext = createContext<TagsContextType | null>(null)

export const TagsProvider = ({ children }:{ children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>([])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/timer/tags')
      const json = await res.json()
      setTags(json.tags || [])
    } catch (error) {
      console.error('Failed to load tags:', error)
      setTags([])
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const createTag = useCallback(async ({ name, type }:{ name: string, type: string }) => {
    const optimistic: Tag = { id: -Date.now(), name, type }
    setTags(prev => [optimistic, ...prev])
    try {
      const res = await fetch('/api/timer/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) })
      const json = await res.json()
      if (json.tag) setTags(prev => prev.map(t => t.id === optimistic.id ? json.tag : t))
      return json.tag as Tag
    } catch {
      setTags(prev => prev.filter(t => t.id !== optimistic.id))
      throw new Error('Failed to create tag')
    }
  }, [])

  const updateTag = useCallback(async ({ id, name, type, description, parentTagId, suggestedTagIds, noAiSuggest }:{ id: number, name?: string, type?: string, description?: string | null, parentTagId?: number | null, suggestedTagIds?: number[] | null, noAiSuggest?: boolean }) => {
    const previousTag = tags.find(t => t.id === id)
    if (!previousTag) return
    setTags(prev => prev.map(t => t.id === id ? { ...t, name: name ?? t.name, type: type ?? t.type, description: description !== undefined ? description : t.description, parentTagId: parentTagId !== undefined ? parentTagId : t.parentTagId, suggestedTagIds: suggestedTagIds !== undefined ? suggestedTagIds : t.suggestedTagIds, noAiSuggest: noAiSuggest !== undefined ? noAiSuggest : t.noAiSuggest } : t))
    try {
      const res = await fetch('/api/timer/tags', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, type, description, parentTagId, suggestedTagIds, noAiSuggest }) })
      const json = await res.json()
      if (json.tag) setTags(prev => prev.map(t => t.id === id ? json.tag : t))
    } catch {
      setTags(prev => prev.map(t => t.id === id ? previousTag : t))
    }
  }, [tags])

  const deleteTag = useCallback(async ({ id }:{ id: number }) => {
    const previousTag = tags.find(t => t.id === id)
    if (!previousTag) return
    setTags(prev => prev.filter(t => t.id !== id))
    try {
      await fetch(`/api/timer/tags?id=${id}`, { method: 'DELETE' })
    } catch {
      setTags(prev => [previousTag, ...prev])
    }
  }, [tags])

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

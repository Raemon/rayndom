'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Tag } from '../types'
import { getApiErrorMessage } from '../lib/optimisticApi'
import { runOptimisticMutation } from '../lib/optimisticMutation'

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
    const tag = await runOptimisticMutation({
      applyOptimistic: () => {
        setTags(prev => [optimistic, ...prev])
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/timer/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to create tag (${res.status})`))
        return (json as { tag?: Tag }).tag as Tag
      },
      commit: (created) => {
        if (created) setTags(prev => prev.map(t => t.id === optimistic.id ? created : t))
      },
      rollback: () => {
        setTags(prev => prev.filter(t => t.id !== optimistic.id))
      },
    })
    return tag
  }, [])

  const updateTag = useCallback(async ({ id, name, type, description, parentTagId, suggestedTagIds, noAiSuggest }:{ id: number, name?: string, type?: string, description?: string | null, parentTagId?: number | null, suggestedTagIds?: number[] | null, noAiSuggest?: boolean }) => {
    const previousTag = tags.find(t => t.id === id)
    if (!previousTag) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setTags(prev => prev.map(t => t.id === id ? { ...t, name: name ?? t.name, type: type ?? t.type, description: description !== undefined ? description : t.description, parentTagId: parentTagId !== undefined ? parentTagId : t.parentTagId, suggestedTagIds: suggestedTagIds !== undefined ? suggestedTagIds : t.suggestedTagIds, noAiSuggest: noAiSuggest !== undefined ? noAiSuggest : t.noAiSuggest } : t))
        return previousTag
      },
      request: async () => {
        const res = await fetch('/api/timer/tags', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, type, description, parentTagId, suggestedTagIds, noAiSuggest }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to update tag (${res.status})`))
        return json as { tag?: Tag }
      },
      commit: (json) => {
        if (json.tag) setTags(prev => prev.map(t => t.id === id ? json.tag as Tag : t))
      },
      rollback: (previous) => {
        setTags(prev => prev.map(t => t.id === id ? previous : t))
      },
      rethrow: false,
    })
  }, [tags])

  const deleteTag = useCallback(async ({ id }:{ id: number }) => {
    const previousTagIndex = tags.findIndex(t => t.id === id)
    const previousTag = tags.find(t => t.id === id)
    if (!previousTag) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setTags(prev => prev.filter(t => t.id !== id))
        return { previousTagIndex, previousTag }
      },
      request: async () => {
        const res = await fetch(`/api/timer/tags?id=${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to delete tag (${res.status})`))
        }
        return true
      },
      rollback: ({ previousTagIndex, previousTag }) => {
        setTags(prev => {
          if (prev.some(t => t.id === previousTag.id)) return prev
          const next = [...prev]
          const insertIndex = previousTagIndex >= 0 && previousTagIndex <= next.length ? previousTagIndex : next.length
          next.splice(insertIndex, 0, previousTag)
          return next
        })
      },
      rethrow: false,
    })
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

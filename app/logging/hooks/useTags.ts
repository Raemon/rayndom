import { useEffect, useState } from 'react'
import type { Tag } from '../types'
import { getApiErrorMessage } from '../lib/optimisticApi'
import { runOptimisticMutation } from '../lib/optimisticMutation'

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
  }

  const updateTag = async ({ id, name, type }:{ id: number, name?: string, type?: string }) => {
    const previousTag = tags.find(t => t.id === id)
    if (!previousTag) return
    const optimisticTag = { ...previousTag, name: name ?? previousTag.name, type: type ?? previousTag.type }
    await runOptimisticMutation({
      applyOptimistic: () => {
        setTags(prev => prev.map(t => t.id === id ? optimisticTag : t))
        return previousTag
      },
      request: async () => {
        const res = await fetch('/api/timer/tags', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, type }) })
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
  }

  const deleteTag = async ({ id }:{ id: number }) => {
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
  }

  return { tags, setTags, load, createTag, updateTag, deleteTag }
}

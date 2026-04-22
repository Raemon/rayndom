import { useEffect, useRef, useState } from 'react'
import type { Prompt } from '../types'
import { getApiErrorMessage } from '../lib/optimisticApi'
import { runOptimisticMutation } from '../lib/optimisticMutation'

export const usePrompts = ({ autoLoad=true }:{ autoLoad?: boolean } = {}) => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(autoLoad)
  const promptsRef = useRef<Prompt[]>([])
  const latestUpdateRequestIdRef = useRef<Record<number, number>>({})

  const load = async () => {
    const res = await fetch('/api/timer/prompts')
    const json = await res.json()
    setPrompts(json.prompts || [])
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (autoLoad) load().finally(() => setIsLoading(false)) }, [])
  useEffect(() => { promptsRef.current = prompts }, [prompts])

  const createPrompt = async ({ title, text }:{ title: string, text: string }) => {
    const optimistic: Prompt = { id: -Date.now(), title, text }
    const prompt = await runOptimisticMutation({
      applyOptimistic: () => {
        setPrompts(prev => [...prev, optimistic])
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/timer/prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, text }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to create prompt (${res.status})`))
        return (json as { prompt?: Prompt }).prompt as Prompt
      },
      commit: (created) => {
        if (created) setPrompts(prev => prev.map(p => p.id === optimistic.id ? created : p))
      },
      rollback: () => {
        setPrompts(prev => prev.filter(p => p.id !== optimistic.id))
      },
    })
    return prompt
  }

  const updatePrompt = async ({ id, title, text }:{ id: number, title?: string, text?: string }) => {
    const previousPrompt = promptsRef.current.find(p => p.id === id)
    if (!previousPrompt) return false
    const requestId = (latestUpdateRequestIdRef.current[id] || 0) + 1
    latestUpdateRequestIdRef.current[id] = requestId
    const optimisticPrompt = { ...previousPrompt, title: title ?? previousPrompt.title, text: text ?? previousPrompt.text }
    const result = await runOptimisticMutation({
      applyOptimistic: () => {
        setPrompts(prev => prev.map(p => p.id === id ? optimisticPrompt : p))
        return previousPrompt
      },
      request: async () => {
        const res = await fetch('/api/timer/prompts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, title, text }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to update prompt (${res.status})`))
        return json as { prompt?: Prompt }
      },
      commit: (json) => {
        if (latestUpdateRequestIdRef.current[id] !== requestId) return
        if (json.prompt) setPrompts(prev => prev.map(p => p.id === id ? json.prompt as Prompt : p))
      },
      rollback: (previous) => {
        if (latestUpdateRequestIdRef.current[id] !== requestId) return
        setPrompts(prev => prev.map(p => p.id === id ? previous : p))
      },
      rethrow: false,
    })
    return !!result
  }

  const deletePrompt = async ({ id }:{ id: number }) => {
    const previousPromptIndex = prompts.findIndex(p => p.id === id)
    const previousPrompt = prompts.find(p => p.id === id)
    if (!previousPrompt) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setPrompts(prev => prev.filter(p => p.id !== id))
        return { previousPromptIndex, previousPrompt }
      },
      request: async () => {
        const res = await fetch(`/api/timer/prompts?id=${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to delete prompt (${res.status})`))
        }
        return true
      },
      rollback: ({ previousPromptIndex, previousPrompt }) => {
        setPrompts(prev => {
          if (prev.some(p => p.id === previousPrompt.id)) return prev
          const next = [...prev]
          const insertIndex = previousPromptIndex >= 0 && previousPromptIndex <= next.length ? previousPromptIndex : next.length
          next.splice(insertIndex, 0, previousPrompt)
          return next
        })
      },
      rethrow: false,
    })
  }

  return { prompts, isLoading, load, createPrompt, updatePrompt, deletePrompt }
}

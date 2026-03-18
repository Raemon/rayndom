import { useEffect, useRef, useState } from 'react'
import type { Command } from '../types'
import { getApiErrorMessage } from '../lib/optimisticApi'
import { runOptimisticMutation } from '../lib/optimisticMutation'

export const useCommands = ({ autoLoad=true }:{ autoLoad?: boolean } = {}) => {
  const [commands, setCommands] = useState<Command[]>([])
  const commandsRef = useRef<Command[]>([])
  const latestUpdateRequestIdRef = useRef<Record<number, number>>({})

  const load = async () => {
    const res = await fetch('/api/timer/commands')
    const json = await res.json()
    setCommands(json.commands || [])
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (autoLoad) load() }, [])
  useEffect(() => {
    commandsRef.current = commands
  }, [commands])

  const createCommand = async ({ name, html }:{ name: string, html: string }) => {
    const optimistic: Command = { id: -Date.now(), name, html }
    const command = await runOptimisticMutation({
      applyOptimistic: () => {
        setCommands(prev => [optimistic, ...prev])
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/timer/commands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, html }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to create command (${res.status})`))
        return (json as { command?: Command }).command as Command
      },
      commit: (created) => {
        if (created) setCommands(prev => prev.map(c => c.id === optimistic.id ? created : c))
      },
      rollback: () => {
        setCommands(prev => prev.filter(c => c.id !== optimistic.id))
      },
    })
    return command
  }

  const updateCommand = async ({ id, name, html }:{ id: number, name?: string, html?: string }) => {
    const previousCommand = commandsRef.current.find(c => c.id === id)
    if (!previousCommand) return false
    const requestId = (latestUpdateRequestIdRef.current[id] || 0) + 1
    latestUpdateRequestIdRef.current[id] = requestId
    const optimisticCommand = { ...previousCommand, name: name ?? previousCommand.name, html: html ?? previousCommand.html }
    const result = await runOptimisticMutation({
      applyOptimistic: () => {
        setCommands(prev => prev.map(c => c.id === id ? optimisticCommand : c))
        return previousCommand
      },
      request: async () => {
        const res = await fetch('/api/timer/commands', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, html }) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to update command (${res.status})`))
        return json as { command?: Command }
      },
      commit: (json) => {
        if (latestUpdateRequestIdRef.current[id] !== requestId) return
        if (json.command) setCommands(prev => prev.map(c => c.id === id ? json.command as Command : c))
      },
      rollback: (previous) => {
        if (latestUpdateRequestIdRef.current[id] !== requestId) return
        setCommands(prev => prev.map(c => c.id === id ? previous : c))
      },
      rethrow: false,
    })
    return !!result
  }

  const deleteCommand = async ({ id }:{ id: number }) => {
    const previousCommandIndex = commands.findIndex(c => c.id === id)
    const previousCommand = commands.find(c => c.id === id)
    if (!previousCommand) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setCommands(prev => prev.filter(c => c.id !== id))
        return { previousCommandIndex, previousCommand }
      },
      request: async () => {
        const res = await fetch(`/api/timer/commands?id=${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to delete command (${res.status})`))
        }
        return true
      },
      rollback: ({ previousCommandIndex, previousCommand }) => {
        setCommands(prev => {
          if (prev.some(c => c.id === previousCommand.id)) return prev
          const next = [...prev]
          const insertIndex = previousCommandIndex >= 0 && previousCommandIndex <= next.length ? previousCommandIndex : next.length
          next.splice(insertIndex, 0, previousCommand)
          return next
        })
      },
      rethrow: false,
    })
  }

  return { commands, setCommands, load, createCommand, updateCommand, deleteCommand }
}

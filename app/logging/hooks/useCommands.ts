import { useEffect, useState } from 'react'
import type { Command } from '../types'

export const useCommands = ({ autoLoad=true }:{ autoLoad?: boolean } = {}) => {
  const [commands, setCommands] = useState<Command[]>([])

  const load = async () => {
    const res = await fetch('/api/timer/commands')
    const json = await res.json()
    setCommands(json.commands || [])
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (autoLoad) load() }, [])

  const createCommand = async ({ name, html }:{ name: string, html: string }) => {
    const optimistic: Command = { id: -Date.now(), name, html }
    setCommands(prev => [optimistic, ...prev])
    try {
      const res = await fetch('/api/timer/commands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, html }) })
      const json = await res.json()
      if (json.command) setCommands(prev => prev.map(c => c.id === optimistic.id ? json.command : c))
      return json.command as Command
    } catch {
      setCommands(prev => prev.filter(c => c.id !== optimistic.id))
      throw new Error('Failed to create command')
    }
  }

  const updateCommand = async ({ id, name, html }:{ id: number, name?: string, html?: string }) => {
    const previousCommand = commands.find(c => c.id === id)
    if (!previousCommand) return
    const optimisticCommand = { ...previousCommand, name: name ?? previousCommand.name, html: html ?? previousCommand.html }
    setCommands(prev => prev.map(c => c.id === id ? optimisticCommand : c))
    try {
      const res = await fetch('/api/timer/commands', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, html }) })
      const json = await res.json()
      if (json.command) setCommands(prev => prev.map(c => c.id === id ? json.command : c))
    } catch {
      setCommands(prev => prev.map(c => c.id === id ? previousCommand : c))
    }
  }

  const deleteCommand = async ({ id }:{ id: number }) => {
    const previousCommand = commands.find(c => c.id === id)
    if (!previousCommand) return
    setCommands(prev => prev.filter(c => c.id !== id))
    try {
      await fetch(`/api/timer/commands?id=${id}`, { method: 'DELETE' })
    } catch {
      setCommands(prev => [previousCommand, ...prev])
    }
  }

  return { commands, setCommands, load, createCommand, updateCommand, deleteCommand }
}

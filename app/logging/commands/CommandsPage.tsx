'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Command } from '../types'
import { useCommands } from '../hooks/useCommands'
import CommandHtmlEditor from './CommandHtmlEditor'

const CommandRow = ({ command, updateCommand, deleteCommand }:{ command: Command, updateCommand: ({ id, name, html }:{ id: number, name?: string, html?: string }) => Promise<boolean>, deleteCommand: ({ id }:{ id: number }) => Promise<void> }) => {
  const [draftName, setDraftName] = useState(command.name)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const lastSubmittedNameRef = useRef(command.name)
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [])
  const [prevCommandName, setPrevCommandName] = useState(command.name)
  if (command.name !== prevCommandName) {
    setPrevCommandName(command.name)
    if (!isEditingName) setDraftName(command.name)
  }
  useEffect(() => {
    lastSubmittedNameRef.current = command.name
  }, [command.name])
  const saveName = async (name: string) => {
    if (name === lastSubmittedNameRef.current) return true
    lastSubmittedNameRef.current = name
    const didUpdate = await updateCommand({ id: command.id, name })
    if (!didUpdate) {
      lastSubmittedNameRef.current = command.name
      setDraftName(command.name)
      return false
    }
    return true
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          className="px-2 py-1 bg-gray-900 text-white text-xs flex-1"
          value={draftName}
          onFocus={() => { setIsEditingName(true) }}
          onBlur={async () => {
            setIsEditingName(false)
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
            await saveName(draftName)
          }}
          onChange={e => {
            const nextName = e.target.value
            setDraftName(nextName)
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = setTimeout(() => {
              saveName(nextName)
            }, 300)
          }}
        />
        <button className="px-2 py-1 bg-gray-800 text-white text-xs" onClick={() => deleteCommand({ id: command.id })}>Delete</button>
      </div>
      <CommandHtmlEditor value={command.html} onChange={html => updateCommand({ id: command.id, html })} />
    </div>
  )
}

const CommandsPage = () => {
  const { commands, createCommand, updateCommand, deleteCommand } = useCommands()
  const [newName, setNewName] = useState('')
  const [newHtml, setNewHtml] = useState('')
  const sortedCommands = useMemo(() => [...commands].sort((a, b) => a.name.localeCompare(b.name)), [commands])
  const handleCreate = async () => {
    const name = newName.trim()
    const html = newHtml
    if (!name || !html) return
    await createCommand({ name, html })
    setNewName('')
    setNewHtml('')
  }
  return (
    <div className="p-4 text-sm">
      <div className="text-lg text-white mb-2">Commands</div>
      <div className="flex items-center gap-2 mb-2">
        <input className="px-2 py-1 bg-gray-900 text-white text-xs flex-1" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" />
        <button className="px-2 py-1 bg-gray-800 text-white text-xs" onClick={handleCreate}>Add</button>
      </div>
      <div className="mb-4">
        <CommandHtmlEditor value={newHtml} onChange={setNewHtml} placeholder="HTML content to insert..." />
      </div>
      <div className="flex flex-col gap-3">
        {sortedCommands.map(command => (
          <CommandRow key={command.id} command={command} updateCommand={updateCommand} deleteCommand={deleteCommand} />
        ))}
      </div>
    </div>
  )
}

export default CommandsPage

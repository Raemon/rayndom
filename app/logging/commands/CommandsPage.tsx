'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Command } from '../types'
import { useCommands } from '../hooks/useCommands'
import CommandHtmlEditor from './CommandHtmlEditor'

const CommandRow = ({ command, updateCommand, deleteCommand, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }:{ command: Command, updateCommand: ({ id, name, html }:{ id: number, name?: string, html?: string }) => Promise<boolean>, deleteCommand: ({ id }:{ id: number }) => Promise<void>, onDragStart: () => void, onDragOver: (e: React.DragEvent) => void, onDrop: (e: React.DragEvent) => void, onDragEnd: () => void, isDragOver: boolean }) => {
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
    <div className={`flex items-start gap-2 ${isDragOver ? 'border-t border-blue-500' : ''}`} onDragOver={onDragOver} onDrop={onDrop}>
      <div className="flex items-center gap-1 w-1/3 shrink-0">
        <span className="cursor-grab text-gray-600 hover:text-gray-400 text-xs select-none" draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>::</span>
        <input
          className="px-1 py-0.5 bg-transparent text-white text-xs font-semibold flex-1 focus:bg-gray-900"
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
        <button className="px-1 py-0.5 text-gray-500 hover:text-white text-xs" onClick={() => deleteCommand({ id: command.id })}>×</button>
      </div>
      <div className="flex-1 min-w-0">
        <CommandHtmlEditor value={command.html} onChange={html => updateCommand({ id: command.id, html })} />
      </div>
    </div>
  )
}

const CommandsPage = () => {
  const { commands, createCommand, updateCommand, deleteCommand, reorderCommands } = useCommands()
  const [newName, setNewName] = useState('')
  const [newHtml, setNewHtml] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const sortedCommands = useMemo(() => [...commands].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)), [commands])
  const handleCreate = async () => {
    const name = newName.trim()
    const html = newHtml
    if (!name || !html) return
    await createCommand({ name, html })
    setNewName('')
    setNewHtml('')
  }
  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return
    const reordered = [...sortedCommands]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    reorderCommands(reordered.map(c => c.id))
    setDragIndex(null)
    setDragOverIndex(null)
  }
  return (
    <div className="p-4 text-sm max-w-[1400px] mx-auto">
      <div className="text-lg text-white mb-2">Commands</div>
      <div className="flex items-center gap-2 mb-2">
        <input className="px-2 py-1 bg-gray-900 text-white text-xs flex-1" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" />
        <button className="px-2 py-1 bg-gray-800 text-white text-xs" onClick={handleCreate}>Add</button>
      </div>
      <div className="mb-4">
        <CommandHtmlEditor value={newHtml} onChange={setNewHtml} placeholder="HTML content to insert..." />
      </div>
      <div className="flex flex-col gap-2">
        {sortedCommands.map((command, index) => (
          <CommandRow key={command.id} command={command} updateCommand={updateCommand} deleteCommand={deleteCommand} isDragOver={dragOverIndex === index} onDragStart={() => setDragIndex(index)} onDragOver={e => { e.preventDefault(); setDragOverIndex(index) }} onDrop={e => { e.preventDefault(); handleDrop(index) }} onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }} />
        ))}
      </div>
    </div>
  )
}

export default CommandsPage

'use client'
import { useMemo, useState } from 'react'
import { useCommands } from '../hooks/useCommands'

export default function Page() {
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
      <textarea className="w-full px-2 py-1 bg-gray-900 text-white text-xs mb-4" value={newHtml} onChange={e => setNewHtml(e.target.value)} placeholder="HTML to insert" rows={4} />
      <div className="flex flex-col gap-3">
        {sortedCommands.map(command => (
          <div key={command.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input className="px-2 py-1 bg-gray-900 text-white text-xs flex-1" value={command.name} onChange={e => updateCommand({ id: command.id, name: e.target.value })} />
              <button className="px-2 py-1 bg-gray-800 text-white text-xs" onClick={() => deleteCommand({ id: command.id })}>Delete</button>
            </div>
            <textarea className="w-full px-2 py-1 bg-gray-900 text-white text-xs" value={command.html} onChange={e => updateCommand({ id: command.id, html: e.target.value })} rows={4} />
          </div>
        ))}
      </div>
    </div>
  )
}

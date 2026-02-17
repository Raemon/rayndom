'use client'
import { useState } from 'react'
import type { Tag } from '../types'

const TagEditor = ({ tag, onSave, onDelete, onCancel }:{ tag: Tag, onSave: (args: { id: number, name: string, type: string, subtype: string | null, description: string | null }) => Promise<void> | void, onDelete: (args: { id: number }) => Promise<void> | void, onCancel?: () => void }) => {
  const [name, setName] = useState(tag.name)
  const [type, setType] = useState(tag.type)
  const [subtype, setSubtype] = useState(tag.subtype || '')
  const [description, setDescription] = useState(tag.description || '')
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSave({ id: tag.id, name, type, subtype: subtype || null, description: description || null }) }
    if (e.key === 'Escape') { onCancel?.() }
  }
  return (
    <div className="flex flex-col items-start gap-2" onKeyDown={handleKeyDown}>
      <div className="flex gap-2 w-full">
        <input className="px-2 py-1 bg-gray-700 text-white outline-none flex-1 text-xs!" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoFocus />
        <input className="px-2 py-1 bg-gray-700 text-white outline-none w-28 text-xs!" value={type} onChange={(e) => setType(e.target.value)} placeholder="Type" />
        <input className="px-2 py-1 bg-gray-700 text-white outline-none w-24 text-xs!" value={subtype} onChange={(e) => setSubtype(e.target.value)} placeholder="Subtype" />
      </div>
      <textarea className="px-2 py-1 bg-gray-700 text-white outline-none w-full text-xs! resize-none [field-sizing:content]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (for AI tag prediction)" />
      <div className="flex gap-2">
        <button className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs! cursor-pointer" onClick={() => onSave({ id: tag.id, name, type, subtype: subtype || null, description: description || null })}>Save</button>
        <button className="px-2 py-1 bg-red-900/40 hover:bg-red-900/70 text-red-300 text-xs! cursor-pointer" onClick={() => { if (window.confirm(`Delete tag "${tag.name}"?`)) onDelete({ id: tag.id }) }}>Delete</button>
      </div>
    </div>
  )
}

export default TagEditor

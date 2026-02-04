'use client'
import { useState } from 'react'
import type { Tag } from '../types'

const TagEditor = ({ tag, onSave, onDelete, onCancel }:{ tag: Tag, onSave: (args: { id: number, name: string, type: string, description: string | null }) => Promise<void> | void, onDelete: (args: { id: number }) => Promise<void> | void, onCancel?: () => void }) => {
  const [name, setName] = useState(tag.name)
  const [type, setType] = useState(tag.type)
  const [description, setDescription] = useState(tag.description || '')
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSave({ id: tag.id, name, type, description: description || null }) }
    if (e.key === 'Escape') { onCancel?.() }
  }
  return (
    <div className="flex flex-col items-start gap-2" onKeyDown={handleKeyDown}>
      <input className="px-2 py-1 bg-gray-100 outline-none w-full flex-1 text-xs!" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoFocus />
      <input className="px-2 py-1 bg-gray-100 outline-none w-28 text-xs!" value={type} onChange={(e) => setType(e.target.value)} placeholder="Type" />
      <textarea className="px-2 py-1 bg-gray-100 outline-none w-full text-xs! resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (for AI tag prediction)" rows={2} />
      <div className="flex gap-2">
        <button className="px-2 py-1 border border-gray-600 text-xs!" onClick={() => onSave({ id: tag.id, name, type, description: description || null })}>Save</button>
        <button className="px-2 py-1 border border-gray-600 text-xs!" onClick={() => onDelete({ id: tag.id })}>Delete</button>
      </div>
    </div>
  )
}

export default TagEditor

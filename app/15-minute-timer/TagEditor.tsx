'use client'
import { useState } from 'react'
import type { Tag } from './types'

const TagEditor = ({ tag, onSave, onDelete }:{ tag: Tag, onSave: (args: { id: number, name: string, type: string }) => Promise<void> | void, onDelete: (args: { id: number }) => Promise<void> | void }) => {
  const [name, setName] = useState(tag.name)
  const [type, setType] = useState(tag.type)

  return (
    <div className="flex flex-col items-start gap-2">
      <input className="px-2 py-1 bg-gray-100 outline-none w-full flex-1 text-xs!" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="px-2 py-1 bg-gray-100 outline-none w-28 text-xs!" value={type} onChange={(e) => setType(e.target.value)} />
      <button className="px-2 py-1 border border-gray-600 text-xs!" onClick={() => onSave({ id: tag.id, name, type })}>Save</button>
      <button className="px-2 py-1 border border-gray-600 text-xs!" onClick={() => onDelete({ id: tag.id })}>Delete</button>
    </div>
  )
}

export default TagEditor

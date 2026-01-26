'use client'
import { useState } from 'react'
import type { Tag } from './types'

const TagEditor = ({ tag, onSave, onDelete }:{ tag: Tag, onSave: (args: { id: number, name: string, type: string }) => Promise<void> | void, onDelete: (args: { id: number }) => Promise<void> | void }) => {
  const [name, setName] = useState(tag.name)
  const [type, setType] = useState(tag.type)

  return (
    <div className="flex items-center gap-2">
      <input className="px-2 py-1 bg-gray-100 outline-none flex-1" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="px-2 py-1 bg-gray-100 outline-none w-28" value={type} onChange={(e) => setType(e.target.value)} />
      <button className="px-2 py-1 bg-gray-600" onClick={() => onSave({ id: tag.id, name, type })}>Save</button>
      <button className="px-2 py-1 bg-gray-600" onClick={() => onDelete({ id: tag.id })}>Del</button>
    </div>
  )
}

export default TagEditor

'use client'
import { useState } from 'react'

const AddChecklistItem = ({ onAdd, placeholder = 'Add checklist item', textSize = 'text-2xl', inputPadding = 'px-4 py-3', groupHover = 'group-hover:text-white' }:{
  onAdd: (title: string) => void | Promise<void>
  placeholder?: string
  textSize?: string
  inputPadding?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newItem, setNewItem] = useState('')
  const handleAdd = async () => {
    if (newItem.trim()) {
      await onAdd(newItem.trim())
      setNewItem('')
      setIsExpanded(false)
    }
  }
  if (!isExpanded) {
    return (
      <button onClick={() => setIsExpanded(true)} className={`${inputPadding} bg-gray-600 ${textSize}`}>+</button>
    )
  }
  return (
    <div className={`flex gap-2 ${groupHover}`}>
      <input
        type="text"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd()
          if (e.key === 'Escape') { setNewItem(''); setIsExpanded(false) }
        }}
        className={`${inputPadding} bg-gray-100 outline-none flex-1 ${textSize}`}
        placeholder={placeholder}
        autoFocus
      />
      <button onClick={handleAdd} className={`${inputPadding} bg-gray-600 ${textSize}`}>Add</button>
    </div>
  )
}

export default AddChecklistItem

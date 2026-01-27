'use client'
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

type ChecklistItem = { id: number; title: string; completed: boolean }

export type ChecklistRef = {
  resetAllItems: () => void
  refreshItems: () => void
}

const Checklist = forwardRef<ChecklistRef, object>((_, ref) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState('')
  const checklistItemsRef = useRef<ChecklistItem[]>([])

  useEffect(() => {
    fetch('/api/checklist').then(r => r.json()).then(setChecklistItems)
  }, [])

  useEffect(() => {
    checklistItemsRef.current = checklistItems
  }, [checklistItems])

  const refreshItems = async () => {
    const res = await fetch('/api/checklist')
    const items = await res.json()
    setChecklistItems(items)
  }

  useImperativeHandle(ref, () => ({
    resetAllItems: () => {
      checklistItemsRef.current.forEach(item => {
        if (item.completed) {
          fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, completed: false }) })
        }
      })
      setChecklistItems(items => items.map(item => ({ ...item, completed: false })))
    },
    refreshItems
  }))

  const addChecklistItem = async () => {
    if (newItem.trim()) {
      const res = await fetch('/api/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newItem.trim() }) })
      const item = await res.json()
      setChecklistItems([...checklistItems, item])
      setNewItem('')
    }
  }

  const removeChecklistItem = async (id: number) => {
    await fetch('/api/checklist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setChecklistItems(checklistItems.filter(item => item.id !== id))
  }

  const toggleChecked = async (id: number) => {
    const item = checklistItems.find(i => i.id === id)
    if (!item) return
    const completed = !item.completed
    await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed }) })
    setChecklistItems(checklistItems.map(i => i.id === id ? { ...i, completed } : i))
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 p-3" style={{ width: '400px' }}>
      <div className="mb-2 font-semibold">Checklist:</div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
          className="px-2 py-1 bg-gray-100 outline-none flex-1"
          placeholder="Add checklist item"
        />
        <button onClick={addChecklistItem} className="px-2 py-1 bg-gray-600">Add</button>
      </div>
      <div className="flex flex-col gap-1">
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleChecked(item.id)}>
            <input type="checkbox" checked={item.completed} onChange={() => {}} />
            <span className="flex-1">{item.title}</span>
            <button onClick={(e) => { e.stopPropagation(); removeChecklistItem(item.id) }} className="px-2 py-1 text-white cursor-pointer opacity-50 hover:opacity-100">x</button>
          </div>
        ))}
        {checklistItems.length === 0 && <div className="text-gray-600">No items</div>}
      </div>
    </div>
  )
})

Checklist.displayName = 'Checklist'

export default Checklist

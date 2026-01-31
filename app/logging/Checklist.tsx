'use client'
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import DragDropList from '@/app/components/DragDropList'

type ChecklistItem = { id: number; title: string; completed: boolean; sortOrder: number; orientingBlock: boolean }

export type ChecklistRef = {
  resetAllItems: () => void
  refreshItems: () => void
}

export type ChecklistProps = {
  orientingOnly?: boolean
  inline?: boolean
}

const Checklist = forwardRef<ChecklistRef, ChecklistProps>(({ orientingOnly = false, inline = false }, ref) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState('')
  const checklistItemsRef = useRef<ChecklistItem[]>([])

  useEffect(() => {
    const url = orientingOnly ? '/api/checklist?orientingOnly=true' : '/api/checklist'
    fetch(url).then(r => r.json()).then(setChecklistItems)
  }, [orientingOnly])

  useEffect(() => {
    checklistItemsRef.current = checklistItems
  }, [checklistItems])

  const refreshItems = async () => {
    const url = orientingOnly ? '/api/checklist?orientingOnly=true' : '/api/checklist'
    const res = await fetch(url)
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
      const res = await fetch('/api/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newItem.trim(), orientingBlock: orientingOnly }) })
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

  const handleReorder = async (newItems: ChecklistItem[]) => {
    setChecklistItems(newItems)
    const orderedIds = newItems.map(item => item.id)
    await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderedIds }) })
  }

  const allCompleted = checklistItems.length > 0 && checklistItems.every(item => item.completed)
  const width = allCompleted ? '400px' : '800px'
  const height = allCompleted ? 'auto' : '600px'
  const textSize = allCompleted ? 'text-sm' : 'text-2xl'
  const padding = allCompleted ? 'p-3' : 'p-6'
  const gap = allCompleted ? 'gap-2' : 'gap-4'
  const itemGap = allCompleted ? 'gap-1' : 'gap-3'
  const inputPadding = allCompleted ? 'px-2 py-1' : 'px-4 py-3'
  const checkboxSize = allCompleted ? 'w-4 h-4' : 'w-6 h-6'

  const positionClass = inline ? '' : 'fixed bottom-4 right-4'
  const bgClass = inline ? '' : 'bg-gray-900'
  const inlineStyle = inline ? { width: '100%', maxWidth: width, height } : { width, height }
  return (
    <div className={`${positionClass} ${bgClass} ${padding}`} style={inlineStyle}>
      <div className={`mb-2 font-semibold ${textSize}`}>Checklist:</div>
      <div className={`flex ${gap} mb-2`}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
          className={`${inputPadding} bg-gray-100 outline-none flex-1 ${textSize}`}
          placeholder="Add checklist item"
        />
        <button onClick={addChecklistItem} className={`${inputPadding} bg-gray-600 ${textSize}`}>Add</button>
      </div>
      <div className={`flex flex-col ${itemGap}`}>
        <DragDropList
          items={checklistItems}
          keyExtractor={(item) => item.id}
          onReorder={handleReorder}
          renderItem={(item) => (
            <div className={`flex items-center ${gap} cursor-pointer`} onClick={() => toggleChecked(item.id)}>
              <span className="cursor-grab mr-2 opacity-50 hover:opacity-100">⋮⋮</span>
              <input type="checkbox" checked={item.completed} onChange={() => {}} className={checkboxSize} style={{ accentColor: 'black' }} />
              <span className={`flex-1 ${textSize}`}>{item.title}</span>
              <button onClick={(e) => { e.stopPropagation(); removeChecklistItem(item.id) }} className={`${inputPadding} text-white cursor-pointer opacity-50 hover:opacity-100 ${textSize}`}>x</button>
            </div>
          )}
        />
        {checklistItems.length === 0 && <div className={`text-gray-600 ${textSize}`}>No items</div>}
      </div>
    </div>
  )
})

Checklist.displayName = 'Checklist'

export default Checklist

'use client'
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import DragDropList from '@/app/components/DragDropList'
import AddChecklistItem from './AddChecklistItem'
import type { ChecklistItem } from '../types'
import { buildChecklistUrl } from './checklistApi'
import OrientingChecklist from './OrientingChecklist'
import TodayNotesChecklistSection from './TodayNotesChecklistSection'
import { getApiErrorMessage } from '../lib/optimisticApi'
import { runOptimisticMutation } from '../lib/optimisticMutation'

const areOrderedIdsEqual = (left: ChecklistItem[], right: ChecklistItem[]) => {
  if (left.length !== right.length) return false
  for (let i = 0; i < left.length; i += 1) {
    if (left[i].id !== right[i].id) return false
  }
  return true
}

export type ChecklistRef = {
  resetAllItems: () => void
  refreshItems: () => void
}

export type ChecklistProps = {
  orientingOnly?: boolean
  inline?: boolean
  fullWidth?: boolean
  section?: string
}

const Checklist = forwardRef<ChecklistRef, ChecklistProps>(({ orientingOnly = false, inline = false, fullWidth = false, section }, ref) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const checklistItemsRef = useRef<ChecklistItem[]>([])

  useEffect(() => {
    const url = buildChecklistUrl(orientingOnly, section)
    fetch(url).then(r => r.json()).then(data => { if (Array.isArray(data)) setChecklistItems(data) })
  }, [orientingOnly, section])

  useEffect(() => {
    checklistItemsRef.current = checklistItems
  }, [checklistItems])

  const refreshItems = async () => {
    const url = buildChecklistUrl(orientingOnly, section)
    const res = await fetch(url)
    const items = await res.json()
    if (Array.isArray(items)) setChecklistItems(items)
  }

  useImperativeHandle(ref, () => ({
    resetAllItems: () => {
      if (orientingOnly) return
      checklistItemsRef.current.forEach(item => {
        if (!item.orientingBlock && item.completed) {
          fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, completed: false }) })
        }
      })
      setChecklistItems(items => items.map(item => (!item.orientingBlock ? { ...item, completed: false } : item)))
    },
    refreshItems
  }))

  const addChecklistItem = async (title: string) => {
    const existingChecklistItems = checklistItems
    let nextOptimisticId = -1
    for (const existingItem of existingChecklistItems) {
      if (existingItem.id <= nextOptimisticId) nextOptimisticId = existingItem.id - 1
    }
    const optimistic: ChecklistItem = { id: nextOptimisticId, title, completed: false, sortOrder: checklistItems.length, orientingBlock: orientingOnly, section: section ?? null }
    await runOptimisticMutation({
      applyOptimistic: () => {
        setChecklistItems(prev => [...prev, optimistic])
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, orientingBlock: orientingOnly, section }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to create checklist item (${res.status})`))
        }
        const item = await res.json()
        return item as ChecklistItem
      },
      commit: (item) => {
        setChecklistItems(prev => prev.map(existing => existing.id === optimistic.id ? item : existing))
      },
      rollback: () => {
        setChecklistItems(prev => prev.filter(existing => existing.id !== optimistic.id))
      },
      rethrow: false,
    })
  }

  const removeChecklistItem = async (id: number) => {
    const previousIndex = checklistItems.findIndex(item => item.id === id)
    const previousChecklistItem = checklistItems.find(item => item.id === id)
    if (!previousChecklistItem) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setChecklistItems(prev => prev.filter(item => item.id !== id))
        return { previousIndex, previousChecklistItem }
      },
      request: async () => {
        const res = await fetch('/api/checklist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to delete checklist item (${res.status})`))
        }
        return true
      },
      rollback: ({ previousIndex, previousChecklistItem }) => {
        setChecklistItems(prev => {
          if (prev.some(item => item.id === previousChecklistItem.id)) return prev
          const next = [...prev]
          const insertIndex = previousIndex >= 0 && previousIndex <= next.length ? previousIndex : next.length
          next.splice(insertIndex, 0, previousChecklistItem)
          return next
        })
      },
      rethrow: false,
    })
  }

  const toggleChecked = async (id: number) => {
    const item = checklistItems.find(i => i.id === id)
    if (!item) return
    const completed = !item.completed
    const previousChecklistItems = checklistItems
    await runOptimisticMutation({
      applyOptimistic: () => {
        setChecklistItems(prev => prev.map(i => i.id === id ? { ...i, completed } : i))
        const previousChecklistItem = previousChecklistItems.find(i => i.id === id)
        return previousChecklistItem
      },
      request: async () => {
        const res = await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to update checklist item (${res.status})`))
        }
        return true
      },
      rollback: (previousChecklistItem) => {
        if (!previousChecklistItem) return
        setChecklistItems(prev => prev.map(i => i.id === id ? previousChecklistItem : i))
      },
      rethrow: false,
    })
  }

  const handleReorder = async (newItems: ChecklistItem[]) => {
    const previousChecklistItems = checklistItems
    const orderedIds = newItems.map(item => item.id)
    await runOptimisticMutation({
      applyOptimistic: () => {
        setChecklistItems(newItems)
        return previousChecklistItems
      },
      request: async () => {
        const res = await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderedIds }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to reorder checklist (${res.status})`))
        }
        return true
      },
      rollback: (previousChecklistItems) => {
        setChecklistItems(prev => areOrderedIdsEqual(prev, newItems) ? previousChecklistItems : prev)
      },
      rethrow: false,
    })
  }

  const [hasRelevantUnchecked, setHasRelevantUnchecked] = useState(false)
  const allCompleted = checklistItems.length > 0 && checklistItems.every(item => item.completed)
  const shouldExpand = !allCompleted || hasRelevantUnchecked
  const width = shouldExpand ? '600px' : '200px'
  const height = shouldExpand ? 'auto' : 'auto'
  const textSize = shouldExpand ? 'text-2xl' : 'text-sm'
  const padding = shouldExpand ? 'p-6' : 'p-3'
  const gap = shouldExpand ? 'gap-4' : 'gap-2'
  const itemGap = shouldExpand ? 'gap-3' : 'gap-1'
  const inputPadding = shouldExpand ? 'px-4 py-3' : 'px-2 py-1'
  const checkboxSize = shouldExpand ? 'w-6 h-6' : 'w-4 h-4'
  const justifySelfClass = shouldExpand ? 'justify-self-center' : 'justify-self-end'

  const positionClass = inline ? '' : 'fixed bottom-4 right-4'
  const bgClass = inline ? '' : 'bg-gray-900'
  const inlineStyle = inline ? (fullWidth ? { width: '100%', height } : { width: '100%', maxWidth: width, height }) : { width, height }
  return (
    <div className={`${positionClass} ${bgClass} ${padding} ${justifySelfClass} overflow-y-auto`} style={inlineStyle}>
      <div className="flex items-center justify-between">
        <div className={`mb-2 font-semibold ${textSize}`}>Checklist:</div>
        <div className={`mb-2`}>
          <AddChecklistItem onAdd={addChecklistItem} placeholder="Add checklist item" textSize={textSize} inputPadding={inputPadding} />
        </div>
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
      <div className="mt-4">
        <OrientingChecklist maxWidth={fullWidth ? 9999 : parseInt(width)} onHasRelevantUnchecked={setHasRelevantUnchecked} />
      </div>
      <TodayNotesChecklistSection textSize={textSize} />
    </div>
  )
})

Checklist.displayName = 'Checklist'

export default Checklist

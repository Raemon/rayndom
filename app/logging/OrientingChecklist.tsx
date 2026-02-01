'use client'
import { useEffect, useMemo, useState, type DragEvent } from 'react'
import AddChecklistItem from './AddChecklistItem'

type ChecklistItem = { id: number; title: string; completed: boolean; sortOrder: number; orientingBlock: boolean; section: string | null }

type SectionKey = 'morning' | 'afternoon' | 'evening' | 'night'

const coerceSection = (section: string | null): SectionKey => {
  if (section === 'afternoon' || section === 'evening' || section === 'night') return section
  return 'morning'
}

const moveInArray = <T,>(array: T[], fromIndex: number, toIndex: number) => {
  const next = [...array]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

const OrientingChecklist = ({ maxWidth=600 }:{ maxWidth?: number }) => {
  const [itemsBySection, setItemsBySection] = useState<Record<SectionKey, ChecklistItem[]>>({ morning: [], afternoon: [], evening: [], night: [] })

  const refreshItems = async () => {
    const res = await fetch('/api/checklist?orientingOnly=true')
    const items = await res.json()
    const next: Record<SectionKey, ChecklistItem[]> = { morning: [], afternoon: [], evening: [], night: [] }
    for (const item of items as ChecklistItem[]) {
      next[coerceSection(item.section)].push(item)
    }
    setItemsBySection(next)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshItems()
  }, [])

  const persistOrder = async (section: SectionKey, items: ChecklistItem[]) => {
    const orderedIds = items.map(i => i.id)
    await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderedIds }) })
  }

  const toggleChecked = async (section: SectionKey, id: number) => {
    const item = itemsBySection[section].find(i => i.id === id)
    if (!item) return
    const completed = !item.completed
    await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed }) })
    setItemsBySection(prev => ({ ...prev, [section]: prev[section].map(i => i.id === id ? { ...i, completed } : i) }))
  }

  const removeChecklistItem = async (section: SectionKey, id: number) => {
    await fetch('/api/checklist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setItemsBySection(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }))
  }

  const addChecklistItem = async (section: SectionKey, title: string) => {
    const res = await fetch('/api/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, orientingBlock: true, section }) })
    const item = await res.json()
    setItemsBySection(prev => ({ ...prev, [section]: [...prev[section], item] }))
  }

  const beginDrag = (e: DragEvent, id: number, section: SectionKey) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, section }))
  }

  const parseDrag = (e: DragEvent): { id: number, section: SectionKey } | null => {
    try {
      const raw = e.dataTransfer.getData('text/plain')
      const parsed = JSON.parse(raw)
      if (typeof parsed?.id !== 'number') return null
      if (parsed?.section !== 'morning' && parsed?.section !== 'afternoon' && parsed?.section !== 'evening' && parsed?.section !== 'night') return null
      return parsed
    } catch {
      return null
    }
  }

  const moveItemToSectionEnd = async (fromSection: SectionKey, id: number, toSection: SectionKey) => {
    if (fromSection === toSection) return
    const dragged = itemsBySection[fromSection].find(i => i.id === id)
    if (!dragged) return
    const nextFrom = itemsBySection[fromSection].filter(i => i.id !== id)
    const nextTo = [...itemsBySection[toSection], { ...dragged, section: toSection }]
    setItemsBySection(prev => ({ ...prev, [fromSection]: nextFrom, [toSection]: nextTo }))
    await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, section: toSection }) })
    await persistOrder(fromSection, nextFrom)
    await persistOrder(toSection, nextTo)
  }

  const handleDropOnItem = async (targetSection: SectionKey, targetIndex: number, e: DragEvent) => {
    e.preventDefault()
    const dragged = parseDrag(e)
    if (!dragged) return
    if (dragged.section === targetSection) {
      const sourceIndex = itemsBySection[targetSection].findIndex(i => i.id === dragged.id)
      if (sourceIndex === -1 || sourceIndex === targetIndex) return
      const next = moveInArray(itemsBySection[targetSection], sourceIndex, targetIndex)
      setItemsBySection(prev => ({ ...prev, [targetSection]: next }))
      await persistOrder(targetSection, next)
      return
    }
    const fromSection = dragged.section
    const draggedItem = itemsBySection[fromSection].find(i => i.id === dragged.id)
    if (!draggedItem) return
    const nextFrom = itemsBySection[fromSection].filter(i => i.id !== dragged.id)
    const nextTo = [...itemsBySection[targetSection]]
    nextTo.splice(targetIndex, 0, { ...draggedItem, section: targetSection })
    setItemsBySection(prev => ({ ...prev, [fromSection]: nextFrom, [targetSection]: nextTo }))
    await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: dragged.id, section: targetSection }) })
    await persistOrder(fromSection, nextFrom)
    await persistOrder(targetSection, nextTo)
  }

  const sections = useMemo(() => ([
    { key: 'morning' as const, label: 'Morning' },
    { key: 'afternoon' as const, label: 'Afternoon' },
    { key: 'evening' as const, label: 'Evening' },
    { key: 'night' as const, label: 'Night' },
  ]), [])

  return (
    <div style={{ width: '100%', maxWidth }}>
      <div className="p-2 bg-black/20">
        <div className="flex flex-col gap-3">
        {sections.map(section => (
          <div
            key={section.key}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
            onDrop={(e) => {
              e.preventDefault()
              const dragged = parseDrag(e)
              if (!dragged) return
              moveItemToSectionEnd(dragged.section, dragged.id, section.key)
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="font-semibold text-gray-300">{section.label}</div>
              <div className="flex-1"></div>
              <AddChecklistItem onAdd={(title) => addChecklistItem(section.key, title)} placeholder="Add item" textSize="text-sm" inputPadding="px-2 py-1" />
            </div>
            <div className="flex flex-col gap-1">
              {itemsBySection[section.key].map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => beginDrag(e, item.id, section.key)}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                  onDrop={(e) => handleDropOnItem(section.key, index, e)}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleChecked(section.key, item.id)}
                >
                  <span className="cursor-grab opacity-50 hover:opacity-100">⋮⋮</span>
                  <input type="checkbox" checked={item.completed} onChange={() => {}} className="w-4 h-4" style={{ accentColor: 'black' }} />
                  <span className="flex-1 text-sm">{item.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeChecklistItem(section.key, item.id) }} className="text-white cursor-pointer opacity-50 hover:opacity-100 text-sm">x</button>
                </div>
              ))}
              {itemsBySection[section.key].length === 0 && <div className="text-gray-600 text-sm">No items</div>}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default OrientingChecklist

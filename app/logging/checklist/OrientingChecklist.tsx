'use client'
import { useEffect, useMemo, useState, type DragEvent } from 'react'
import type { ChecklistItem, SectionKey } from '../types'
import { getCurrentSection, coerceSection, SECTION_DEFINITIONS_SIMPLE } from './sectionUtils'
import { beginDrag, parseDrag } from './useOrientingChecklistDrag'
import OrientingChecklistSection from './OrientingChecklistSection'

const moveInArray = <T,>(array: T[], fromIndex: number, toIndex: number) => {
  const next = [...array]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

const OrientingChecklist = ({ maxWidth=600 }:{ maxWidth?: number }) => {
  const [itemsBySection, setItemsBySection] = useState<Record<SectionKey, ChecklistItem[]>>({ morning: [], afternoon: [], evening: [], night: [] })
  const [currentSection, setCurrentSection] = useState<SectionKey>(getCurrentSection())
  const [collapsedOverrides, setCollapsedOverrides] = useState<Partial<Record<SectionKey, boolean>>>({})
  useEffect(() => {
    const interval = setInterval(() => setCurrentSection(getCurrentSection()), 30000)
    return () => clearInterval(interval)
  }, [])

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

  const sections = useMemo(() => SECTION_DEFINITIONS_SIMPLE, [])

  return (
    <div style={{ width: '100%', maxWidth }}>
      <div className="p-2 bg-black/20">
        <div className="flex flex-col gap-3">
        {sections.map(section => {
          const hasUnchecked = itemsBySection[section.key].some(i => !i.completed)
          const defaultCollapsed = !hasUnchecked && section.key !== currentSection
          const isCollapsed = collapsedOverrides[section.key] ?? defaultCollapsed
          return (
            <OrientingChecklistSection
              key={section.key}
              sectionKey={section.key}
              sectionLabel={section.label}
              items={itemsBySection[section.key]}
              isCollapsed={isCollapsed}
              hasUnchecked={hasUnchecked}
              onToggleCollapsed={() => setCollapsedOverrides(prev => ({ ...prev, [section.key]: !(prev[section.key] ?? defaultCollapsed) }))}
              onToggleChecked={(id) => toggleChecked(section.key, id)}
              onRemoveItem={(id) => removeChecklistItem(section.key, id)}
              onAddItem={(title) => addChecklistItem(section.key, title)}
              onBeginDrag={(e, id) => beginDrag(e, id, section.key)}
              onDropOnItem={(targetIndex, e) => handleDropOnItem(section.key, targetIndex, e)}
              onDropOnSection={(e) => {
                e.preventDefault()
                const dragged = parseDrag(e)
                if (!dragged) return
                moveItemToSectionEnd(dragged.section, dragged.id, section.key)
              }}
              parseDrag={parseDrag}
            />
          )
        })}
        </div>
      </div>
    </div>
  )
}

export default OrientingChecklist

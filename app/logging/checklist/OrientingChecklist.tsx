'use client'
import { useEffect, useMemo, useState, type DragEvent } from 'react'
import type { ChecklistItem, SectionKey } from '../types'
import { getCurrentSection, coerceSection, SECTION_DEFINITIONS_SIMPLE, SECTION_ORDER } from './sectionUtils'
import { beginDrag, parseDrag } from './useOrientingChecklistDrag'
import OrientingChecklistSection from './OrientingChecklistSection'

const moveInArray = <T,>(array: T[], fromIndex: number, toIndex: number) => {
  const next = [...array]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

const OrientingChecklist = ({ maxWidth=600, onHasRelevantUnchecked }:{ maxWidth?: number, onHasRelevantUnchecked?: (hasUnchecked: boolean) => void }) => {
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
    const previousItemsBySection = itemsBySection
    setItemsBySection(prev => ({ ...prev, [section]: prev[section].map(i => i.id === id ? { ...i, completed } : i) }))
    try {
      await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed }) })
    } catch {
      setItemsBySection(previousItemsBySection)
    }
  }

  const removeChecklistItem = async (section: SectionKey, id: number) => {
    const previousItemsBySection = itemsBySection
    setItemsBySection(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }))
    try {
      await fetch('/api/checklist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    } catch {
      setItemsBySection(previousItemsBySection)
    }
  }

  const addChecklistItem = async (section: SectionKey, title: string) => {
    const sectionItems = itemsBySection[section]
    let nextOptimisticId = -1
    for (const sectionItem of sectionItems) {
      if (sectionItem.id <= nextOptimisticId) nextOptimisticId = sectionItem.id - 1
    }
    const optimistic: ChecklistItem = { id: nextOptimisticId, title, completed: false, sortOrder: itemsBySection[section].length, orientingBlock: true, section }
    setItemsBySection(prev => ({ ...prev, [section]: [...prev[section], optimistic] }))
    try {
      const res = await fetch('/api/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, orientingBlock: true, section }) })
      const item = await res.json()
      setItemsBySection(prev => ({ ...prev, [section]: prev[section].map(existing => existing.id === optimistic.id ? item : existing) }))
    } catch {
      setItemsBySection(prev => ({ ...prev, [section]: prev[section].filter(existing => existing.id !== optimistic.id) }))
    }
  }


  const moveItemToSectionEnd = async (fromSection: SectionKey, id: number, toSection: SectionKey) => {
    if (fromSection === toSection) return
    const dragged = itemsBySection[fromSection].find(i => i.id === id)
    if (!dragged) return
    const nextFrom = itemsBySection[fromSection].filter(i => i.id !== id)
    const nextTo = [...itemsBySection[toSection], { ...dragged, section: toSection }]
    const previousItemsBySection = itemsBySection
    setItemsBySection(prev => ({ ...prev, [fromSection]: nextFrom, [toSection]: nextTo }))
    try {
      await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, section: toSection }) })
      await persistOrder(fromSection, nextFrom)
      await persistOrder(toSection, nextTo)
    } catch {
      setItemsBySection(previousItemsBySection)
    }
  }

  const handleDropOnItem = async (targetSection: SectionKey, targetIndex: number, e: DragEvent) => {
    e.preventDefault()
    const dragged = parseDrag(e)
    if (!dragged) return
    if (dragged.section === targetSection) {
      const sourceIndex = itemsBySection[targetSection].findIndex(i => i.id === dragged.id)
      if (sourceIndex === -1 || sourceIndex === targetIndex) return
      const next = moveInArray(itemsBySection[targetSection], sourceIndex, targetIndex)
      const previousItemsBySection = itemsBySection
      setItemsBySection(prev => ({ ...prev, [targetSection]: next }))
      try {
        await persistOrder(targetSection, next)
      } catch {
        setItemsBySection(previousItemsBySection)
      }
      return
    }
    const fromSection = dragged.section
    const draggedItem = itemsBySection[fromSection].find(i => i.id === dragged.id)
    if (!draggedItem) return
    const nextFrom = itemsBySection[fromSection].filter(i => i.id !== dragged.id)
    const nextTo = [...itemsBySection[targetSection]]
    nextTo.splice(targetIndex, 0, { ...draggedItem, section: targetSection })
    const previousItemsBySection = itemsBySection
    setItemsBySection(prev => ({ ...prev, [fromSection]: nextFrom, [targetSection]: nextTo }))
    try {
      await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: dragged.id, section: targetSection }) })
      await persistOrder(fromSection, nextFrom)
      await persistOrder(targetSection, nextTo)
    } catch {
      setItemsBySection(previousItemsBySection)
    }
  }

  const sections = useMemo(() => SECTION_DEFINITIONS_SIMPLE, [])

  useEffect(() => {
    if (!onHasRelevantUnchecked) return
    const currentIdx = SECTION_ORDER[currentSection]
    const hasRelevant = sections.some((s, i) => i <= currentIdx && itemsBySection[s.key].some(item => !item.completed))
    onHasRelevantUnchecked(hasRelevant)
  }, [itemsBySection, currentSection, onHasRelevantUnchecked, sections])

  return (
    <div style={{ width: '100%', maxWidth }}>
      <div className="p-2 bg-black/20">
        <div className="flex flex-col gap-3">
        {sections.map((section, sectionIndex) => {
          const hasUnchecked = itemsBySection[section.key].some(i => !i.completed)
          const isReached = sectionIndex <= SECTION_ORDER[currentSection]
          const defaultCollapsed = !(section.key === currentSection || (hasUnchecked && isReached))
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

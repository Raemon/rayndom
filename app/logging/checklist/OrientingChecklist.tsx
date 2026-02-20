'use client'
import { useEffect, useMemo, useState, type DragEvent } from 'react'
import type { ChecklistItem, SectionKey } from '../types'
import { getCurrentSection, coerceSection, SECTION_DEFINITIONS_SIMPLE, SECTION_ORDER } from './sectionUtils'
import { beginDrag, parseDrag } from './useOrientingChecklistDrag'
import OrientingChecklistSection from './OrientingChecklistSection'
import { getApiErrorMessage } from '../lib/optimisticApi'
import { runOptimisticMutation } from '../lib/optimisticMutation'

const areOrderedIdsEqual = (left: ChecklistItem[], right: ChecklistItem[]) => {
  if (left.length !== right.length) return false
  for (let i = 0; i < left.length; i += 1) {
    if (left[i].id !== right[i].id) return false
  }
  return true
}

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
    const res = await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderedIds }) })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(getApiErrorMessage(json, `Failed to reorder checklist section (${res.status})`))
    }
  }

  const toggleChecked = async (section: SectionKey, id: number) => {
    const item = itemsBySection[section].find(i => i.id === id)
    if (!item) return
    const completed = !item.completed
    const previousItemsBySection = itemsBySection
    await runOptimisticMutation({
      applyOptimistic: () => {
        setItemsBySection(prev => ({ ...prev, [section]: prev[section].map(i => i.id === id ? { ...i, completed } : i) }))
        const previousChecklistItem = previousItemsBySection[section].find(i => i.id === id)
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
        setItemsBySection(prev => ({ ...prev, [section]: prev[section].map(i => i.id === id ? previousChecklistItem : i) }))
      },
      rethrow: false,
    })
  }

  const removeChecklistItem = async (section: SectionKey, id: number) => {
    const previousItemIndex = itemsBySection[section].findIndex(item => item.id === id)
    const previousChecklistItem = itemsBySection[section].find(item => item.id === id)
    if (!previousChecklistItem) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setItemsBySection(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }))
        return { previousItemIndex, previousChecklistItem }
      },
      request: async () => {
        const res = await fetch('/api/checklist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to delete checklist item (${res.status})`))
        }
        return true
      },
      rollback: ({ previousItemIndex, previousChecklistItem }) => {
        setItemsBySection(prev => {
          if (prev[section].some(item => item.id === previousChecklistItem.id)) return prev
          const nextItems = [...prev[section]]
          const insertIndex = previousItemIndex >= 0 && previousItemIndex <= nextItems.length ? previousItemIndex : nextItems.length
          nextItems.splice(insertIndex, 0, previousChecklistItem)
          return { ...prev, [section]: nextItems }
        })
      },
      rethrow: false,
    })
  }

  const addChecklistItem = async (section: SectionKey, title: string) => {
    const sectionItems = itemsBySection[section]
    let nextOptimisticId = -1
    for (const sectionItem of sectionItems) {
      if (sectionItem.id <= nextOptimisticId) nextOptimisticId = sectionItem.id - 1
    }
    const optimistic: ChecklistItem = { id: nextOptimisticId, title, completed: false, sortOrder: itemsBySection[section].length, orientingBlock: true, section }
    await runOptimisticMutation({
      applyOptimistic: () => {
        setItemsBySection(prev => ({ ...prev, [section]: [...prev[section], optimistic] }))
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, orientingBlock: true, section }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to create checklist item (${res.status})`))
        }
        const item = await res.json()
        return item as ChecklistItem
      },
      commit: (item) => {
        setItemsBySection(prev => ({ ...prev, [section]: prev[section].map(existing => existing.id === optimistic.id ? item : existing) }))
      },
      rollback: () => {
        setItemsBySection(prev => ({ ...prev, [section]: prev[section].filter(existing => existing.id !== optimistic.id) }))
      },
      rethrow: false,
    })
  }


  const moveItemToSectionEnd = async (fromSection: SectionKey, id: number, toSection: SectionKey) => {
    if (fromSection === toSection) return
    const dragged = itemsBySection[fromSection].find(i => i.id === id)
    if (!dragged) return
    const nextFrom = itemsBySection[fromSection].filter(i => i.id !== id)
    const nextTo = [...itemsBySection[toSection], { ...dragged, section: toSection }]
    const previousItemsBySection = itemsBySection
    await runOptimisticMutation({
      applyOptimistic: () => {
        setItemsBySection(prev => ({ ...prev, [fromSection]: nextFrom, [toSection]: nextTo }))
        return previousItemsBySection
      },
      request: async () => {
        const res = await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, section: toSection }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to move checklist item (${res.status})`))
        }
        await persistOrder(fromSection, nextFrom)
        await persistOrder(toSection, nextTo)
        return true
      },
      rollback: (previousItemsBySection) => {
        setItemsBySection(prev => {
          const fromSectionUnchanged = areOrderedIdsEqual(prev[fromSection], nextFrom)
          const toSectionUnchanged = areOrderedIdsEqual(prev[toSection], nextTo)
          if (!fromSectionUnchanged || !toSectionUnchanged) return prev
          return previousItemsBySection
        })
      },
      rethrow: false,
    })
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
      await runOptimisticMutation({
        applyOptimistic: () => {
          setItemsBySection(prev => ({ ...prev, [targetSection]: next }))
          return previousItemsBySection
        },
        request: async () => {
          await persistOrder(targetSection, next)
          return true
        },
        rollback: (previousItemsBySection) => {
          setItemsBySection(prev => areOrderedIdsEqual(prev[targetSection], next) ? previousItemsBySection : prev)
        },
        rethrow: false,
      })
      return
    }
    const fromSection = dragged.section
    const draggedItem = itemsBySection[fromSection].find(i => i.id === dragged.id)
    if (!draggedItem) return
    const nextFrom = itemsBySection[fromSection].filter(i => i.id !== dragged.id)
    const nextTo = [...itemsBySection[targetSection]]
    nextTo.splice(targetIndex, 0, { ...draggedItem, section: targetSection })
    const previousItemsBySection = itemsBySection
    await runOptimisticMutation({
      applyOptimistic: () => {
        setItemsBySection(prev => ({ ...prev, [fromSection]: nextFrom, [targetSection]: nextTo }))
        return previousItemsBySection
      },
      request: async () => {
        const res = await fetch('/api/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: dragged.id, section: targetSection }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to move checklist item (${res.status})`))
        }
        await persistOrder(fromSection, nextFrom)
        await persistOrder(targetSection, nextTo)
        return true
      },
      rollback: (previousItemsBySection) => {
        setItemsBySection(prev => {
          const fromSectionUnchanged = areOrderedIdsEqual(prev[fromSection], nextFrom)
          const toSectionUnchanged = areOrderedIdsEqual(prev[targetSection], nextTo)
          if (!fromSectionUnchanged || !toSectionUnchanged) return prev
          return previousItemsBySection
        })
      },
      rethrow: false,
    })
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
      <div className="p-y2">
        <div className="flex flex-col">
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

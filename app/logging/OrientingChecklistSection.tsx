'use client'
import { type DragEvent } from 'react'
import AddChecklistItem from './AddChecklistItem'
import type { ChecklistItem, SectionKey } from './types'

const OrientingChecklistSection = ({
  sectionKey,
  sectionLabel,
  items,
  isCollapsed,
  onToggleCollapsed,
  onToggleChecked,
  onRemoveItem,
  onAddItem,
  onBeginDrag,
  onDropOnItem,
  onDropOnSection,
  parseDrag,
}: {
  sectionKey: SectionKey
  sectionLabel: string
  items: ChecklistItem[]
  isCollapsed: boolean
  onToggleCollapsed: () => void
  onToggleChecked: (id: number) => void
  onRemoveItem: (id: number) => void
  onAddItem: (title: string) => void
  onBeginDrag: (e: DragEvent, id: number) => void
  onDropOnItem: (targetIndex: number, e: DragEvent) => void
  onDropOnSection: (e: DragEvent) => void
  parseDrag: (e: DragEvent) => { id: number; section: SectionKey } | null
}) => {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
      onDrop={onDropOnSection}
    >
      <div className="mb-2 flex items-center gap-2">
        <button className="text-left font-semibold text-gray-300" onClick={onToggleCollapsed}>
          {isCollapsed ? '▶' : '▼'} {sectionLabel}
        </button>
        <div className="flex-1"></div>
        <AddChecklistItem onAdd={onAddItem} placeholder="Add item" textSize="text-sm" inputPadding="px-2 py-1" />
      </div>
      {!isCollapsed && (
        <div className="flex flex-col gap-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onBeginDrag(e, item.id)}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
              onDrop={(e) => onDropOnItem(index, e)}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onToggleChecked(item.id)}
            >
              <span className="cursor-grab opacity-50 hover:opacity-100">⋮⋮</span>
              <input type="checkbox" checked={item.completed} onChange={() => {}} className="w-4 h-4" style={{ accentColor: 'black' }} />
              <span className="flex-1 text-sm">{item.title}</span>
              <button onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id) }} className="text-white cursor-pointer opacity-50 hover:opacity-100 text-sm">x</button>
            </div>
          ))}
          {items.length === 0 && <div className="text-gray-600 text-sm">No items</div>}
        </div>
      )}
    </div>
  )
}

export default OrientingChecklistSection

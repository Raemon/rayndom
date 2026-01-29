'use client'
import { useState } from 'react'
import type { Tag, TagInstance } from './types'
import { getTagColor } from './tagUtils'
import Tooltip from '@/app/common/Tooltip'

const DraggableTag = ({ tag, parentTag, ti, onApproveTagInstance, onDeleteTagInstance, onSetParent }:{
  tag: Tag,
  parentTag: Tag | null | undefined,
  ti: TagInstance,
  onApproveTagInstance?: (args: { id: number }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
  onSetParent: (childId: number, parentId: number) => void,
}) => {
  const [dragOver, setDragOver] = useState(false)
  const isUnapproved = ti.approved === false
  const tooltipParts = [parentTag?.name, ti.llmReason].filter(Boolean)
  const tooltipContent = tooltipParts.length > 0 ? tooltipParts.join(' - ') : (isUnapproved ? 'Click to approve' : null)
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tag.id.toString())
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }
  const handleDragLeave = () => setDragOver(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const draggedTagId = parseInt(e.dataTransfer.getData('text/plain'))
    if (draggedTagId && draggedTagId !== tag.id) {
      onSetParent(draggedTagId, tag.id)
    }
  }
  const tagElement = (
    <span
      className="inline-flex items-center px-2 pt-0.5 pb-0 rounded-xs text-sm text-white"
      style={{ backgroundColor: getTagColor(tag.name), opacity: isUnapproved ? 0.5 : 1, cursor: 'grab', outline: dragOver ? '2px solid white' : undefined }}
      onClick={isUnapproved && onApproveTagInstance ? () => onApproveTagInstance({ id: ti.id }) : undefined}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {tag.name}
      <button className="ml-2 opacity-50 cursor-pointer hover:opacity-100 text-white/60 hover:text-white bg-transparent" onClick={(e) => { e.stopPropagation(); onDeleteTagInstance({ id: ti.id }) }}>×</button>
    </span>
  )
  if (tooltipContent) {
    return <Tooltip content={tooltipContent} placement="top-start">{tagElement}</Tooltip>
  }
  return tagElement
}

export default DraggableTag

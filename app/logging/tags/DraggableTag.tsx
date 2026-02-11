'use client'
import { useState } from 'react'
import type { Tag, TagInstance } from '../types'
import { getTagColor } from './tagUtils'
import Tooltip from '@/app/common/Tooltip'
import TagEditModal from './TagEditModal'
import { useTags } from './TagsContext'

const DraggableTag = ({ tag, parentTag, ti, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance, onSetParent }:{
  tag: Tag,
  parentTag: Tag | null | undefined,
  ti: TagInstance,
  onApproveTagInstance?: (args: { id: number }) => Promise<void> | void,
  onPatchTagInstance: (args: { id: number, useful?: boolean, antiUseful?: boolean }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
  onSetParent: (childId: number, parentId: number) => void,
}) => {
  const { updateTag, deleteTag } = useTags()
  const [dragOver, setDragOver] = useState(false)
  const [showModal, setShowModal] = useState(false)
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
  const handleClick = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      e.preventDefault()
      onPatchTagInstance({ id: ti.id, useful: !ti.useful, antiUseful: false })
    } else if (e.detail === 3) {
      e.preventDefault()
      onPatchTagInstance({ id: ti.id, antiUseful: !ti.antiUseful, useful: false })
    } else if (isUnapproved && onApproveTagInstance) {
      onApproveTagInstance({ id: ti.id })
    }
  }
  const getBorderStyle = () => {
    if (dragOver) return '2px solid white'
    if (ti.useful) return '2px solid white'
    if (ti.antiUseful) return '2px solid red'
    return undefined
  }
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowModal(true)
  }
  const tagElement = (
    <span
      className="inline-flex items-center px-2 pt-0.5 pb-0 rounded-xs text-sm text-white"
      style={{ backgroundColor: getTagColor(tag.name), opacity: isUnapproved ? 0.5 : 1, cursor: 'grab', outline: getBorderStyle() }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
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
  const wrappedElement = tooltipContent
    ? <Tooltip content={tooltipContent} placement="bottom-start">{tagElement}</Tooltip>
    : tagElement
  return (
    <>
      {wrappedElement}
      {showModal && <TagEditModal tag={tag} onSave={({ id, name, type, description }) => updateTag({ id, name, type, description })} onDelete={({ id }) => deleteTag({ id })} onClose={() => setShowModal(false)} />}
    </>
  )
}

export default DraggableTag

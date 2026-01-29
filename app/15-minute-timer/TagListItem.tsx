'use client'
import { useState } from 'react'
import type { Tag } from './types'
import { getTagColor } from './TagCell'
import TagEditor from './TagEditor'
import { useTags } from './TagsContext'

const TagListItem = ({ tag, instanceCount, readonly }:{ tag: Tag, instanceCount: number, readonly?: boolean }) => {
  const { updateTag, deleteTag, tags } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [justDropped, setJustDropped] = useState(false)
  const parentTag = tag.parentTag || (tag.parentTagId ? tags.find(t => t.id === tag.parentTagId) : null)
  if (isEditing && !readonly) {
    return (
      <TagEditor
        tag={tag}
        onSave={async ({ id, name, type }) => { await updateTag({ id, name, type }); setIsEditing(false) }}
        onDelete={async ({ id }) => { await deleteTag({ id }); setIsEditing(false) }}
      />
    )
  }
  const handleDragStart = (e: React.DragEvent) => {
    if (readonly) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tag.id.toString())
  }
  const handleDragOver = (e: React.DragEvent) => {
    if (readonly) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }
  const handleDragLeave = () => {
    setDragOver(false)
  }
  const handleDrop = async (e: React.DragEvent) => {
    if (readonly) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    setJustDropped(true)
    const draggedTagId = parseInt(e.dataTransfer.getData('text/plain'))
    if (draggedTagId && draggedTagId !== tag.id) {
      await updateTag({ id: draggedTagId, parentTagId: tag.id })
    }
    setTimeout(() => setJustDropped(false), 100)
  }
  const handleClick = () => {
    if (readonly || justDropped) return
    setIsEditing(true)
  }
  return (
    <div
      className={`text-left w-full bg-transparent flex items-center ${dragOver ? 'bg-white/10' : ''}`}
      onClick={handleClick}
      draggable={!readonly}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="text-gray-400 mr-1 w-8 text-center text-xs">{instanceCount}</span>
      <div className="flex flex-col" style={{ backgroundColor: getTagColor(tag.name) }}>
        <span className="px-1 rounded-xs text-white text-sm rounded-xs" >{tag.name}</span>
        {parentTag && <div className="text-[9px] opacity-100 px-1 flex items-center gap-1">{parentTag.name}<button className="ml-0.5 hover:opacity-100 opacity-60" onClick={(e) => { e.stopPropagation(); updateTag({ id: tag.id, parentTagId: null }) }}>×</button></div>}
      </div>
    </div>
  )
}

export default TagListItem

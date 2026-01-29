'use client'
import { useState } from 'react'
import TagTypeahead from './TagTypeahead'
import { useTags } from './TagsContext'
import type { Tag, TagInstance } from './types'

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
  const tooltipText = tooltipParts.length > 0 ? tooltipParts.join(' - ') : (isUnapproved ? 'Click to approve' : undefined)
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
  return (
    <span
      key={ti.id}
      className="inline-flex items-center px-2 pt-0.5 pb-0 rounded-xs text-sm text-white"
      style={{ backgroundColor: getTagColor(tag.name), opacity: isUnapproved ? 0.5 : 1, cursor: isUnapproved ? 'pointer' : 'grab', outline: dragOver ? '2px solid white' : undefined }}
      onClick={isUnapproved && onApproveTagInstance ? () => onApproveTagInstance({ id: ti.id }) : undefined}
      title={tooltipText}
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
}

export const getTagColor = (name: string): string => {
  const lower = name.toLowerCase()
  let hue = 0
  let range = 360
  const charCount = Math.min(lower.length, 4)
  for (let i = 0; i < charCount; i++) {
    const code = lower.charCodeAt(i)
    const position = code >= 97 && code <= 122 ? (code - 97) / 26 : (code % 26) / 26
    hue += position * range
    range /= 26
  }
  return `hsl(${Math.floor(hue)}, 50%, 35%)`
}

const TagCell = ({ type, tagInstances, allTagInstances, datetime, onCreateTagInstance, onApproveTagInstance, onDeleteTagInstance }:{
  type: string,
  tagInstances: TagInstance[],
  allTagInstances: TagInstance[],
  datetime: string,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onApproveTagInstance?: (args: { id: number }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const { tags, createTag, updateTag } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  const typeTags = tags.filter(t => t.type === type)
  const handleSetParent = (childId: number, parentId: number) => {
    updateTag({ id: childId, parentTagId: parentId })
  }

  return (
    <div className="flex items-center gap-1 min-w-0 flex-wrap">
      {tagInstances.map(ti => {
        const tag = ti.tag || typeTags.find(t => t.id === ti.tagId)
        if (!tag) return null
        const parentTag = tag.parentTag || (tag.parentTagId ? tags.find(t => t.id === tag.parentTagId) : null)
        return (
          <DraggableTag
            key={ti.id}
            tag={tag}
            parentTag={parentTag}
            ti={ti}
            onApproveTagInstance={onApproveTagInstance}
            onDeleteTagInstance={onDeleteTagInstance}
            onSetParent={handleSetParent}
          />
        )
      })}
      <TagTypeahead
        tags={typeTags}
        allTagInstances={allTagInstances}
        placeholder={type}
        onSelectTag={async (tag) => {
          if (tag.parentTagId) {
            const parentAlreadyExists = tagInstances.some(ti => ti.tagId === tag.parentTagId)
            if (!parentAlreadyExists) {
              await onCreateTagInstance({ tagId: tag.parentTagId, datetime })
            }
          }
          await onCreateTagInstance({ tagId: tag.id, datetime })
          setIsEditing(false)
        }}
        onCreateTag={async (name) => {
          const created = await createTag({ name, type })
          return created
        }}
      />
    </div>
  )
}

export default TagCell

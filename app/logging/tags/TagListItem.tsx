'use client'
import { useState, useRef, useEffect } from 'react'
import type { Tag } from '../types'
import { getTagColor, wouldCreateCycle, getParentTag } from './tagUtils'
import TagEditor from './TagEditor'
import TagEditModal from './TagEditModal'
import { useTags } from './TagsContext'

type TagListItemProps = {
  tag: Tag
  instanceCount: number
  usefulCount?: number
  antiUsefulCount?: number
  readonly?: boolean
  showDescription?: boolean
  hideRelations?: boolean
}

const TagListItem = ({ tag, instanceCount, usefulCount, antiUsefulCount, readonly, showDescription, hideRelations }: TagListItemProps) => {
  const { updateTag, deleteTag, tags } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [justDropped, setJustDropped] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) } }, [])
  const parentTag = getParentTag(tag, tags)
  const tagSuggestedTagIds = tag.suggestedTagIds || []
  const suggestedTags = tagSuggestedTagIds.map(id => tags.find(t => t.id === id)).filter((t): t is Tag => t !== undefined)
  if (isEditing && !readonly) {
    return (
      <TagEditor
        tag={tag}
        onSave={({ id, name, type, description }) => { setIsEditing(false); updateTag({ id, name, type, description }) }}
        onDelete={({ id }) => { setIsEditing(false); deleteTag({ id }) }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tag.id.toString())
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }
  const handleDragLeave = () => {
    setDragOver(false)
  }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    setJustDropped(true)
    const draggedTagId = parseInt(e.dataTransfer.getData('text/plain'))
    const draggedTag = tags.find(t => t.id === draggedTagId)
    const isSameTag = draggedTagId === tag.id
    const isValidDrop = draggedTag && !isSameTag
    if (!isValidDrop) {
      timeoutRef.current = setTimeout(() => setJustDropped(false), 100)
      return
    }
    const isSameType = draggedTag.type === tag.type
    if (isSameType) {
      const wouldCycle = wouldCreateCycle(tags, draggedTagId, tag.id)
      if (!wouldCycle) {
        await updateTag({ id: draggedTagId, parentTagId: tag.id })
      }
      timeoutRef.current = setTimeout(() => setJustDropped(false), 100)
      return
    }
    const existingSuggestedTagIds = Array.isArray(tag.suggestedTagIds) ? tag.suggestedTagIds : []
    const isAlreadySuggested = existingSuggestedTagIds.includes(draggedTagId)
    if (!isAlreadySuggested) {
      await updateTag({ id: tag.id, suggestedTagIds: [...existingSuggestedTagIds, draggedTagId] })
    }
    timeoutRef.current = setTimeout(() => setJustDropped(false), 100)
  }
  const handleDoubleClick = () => {
    if (readonly || justDropped) return
    setShowModal(true)
  }
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowModal(true)
  }
  const getBorderClasses = () => {
    const hasBoth = usefulCount && antiUsefulCount
    const hasUseful = usefulCount && !antiUsefulCount
    const hasAntiUseful = antiUsefulCount && !usefulCount
    if (hasBoth) return 'border-t-2 border-t-white border-r-2 border-r-red-500 border-b-2 border-b-red-500'
    if (hasUseful) return 'border-t-2 border-r-2 border-b-2 border-t-white border-r-white border-b-white'
    if (hasAntiUseful) return 'border-t-2 border-r-2 border-b-2 border-t-red-500 border-r-red-500 border-b-red-500'
    return ''
  }
  const borderClasses = getBorderClasses()
  const handleRemoveParent = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateTag({ id: tag.id, parentTagId: null })
  }
  const handleRemoveSuggestedTag = (suggestedTagId: number) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const existingSuggestedTagIds = Array.isArray(tag.suggestedTagIds) ? tag.suggestedTagIds : []
    const updatedSuggestedTagIds = existingSuggestedTagIds.filter(id => id !== suggestedTagId)
    updateTag({ id: tag.id, suggestedTagIds: updatedSuggestedTagIds })
  }
  return (
    <>
      <div
        className={`text-left w-full bg-transparent flex items-center ${dragOver ? 'bg-white/10' : ''}`}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="text-gray-400 mr-2  w-8 text-center text-xs flex items-center gap-1 justify-end">
          {instanceCount}
          {usefulCount ? <span className="text-green-400">+{usefulCount}</span> : null}
          {antiUsefulCount ? <span className="text-red-400">-{antiUsefulCount}</span> : null}
        </span>
        <div className={`flex flex-col p-2 border-b-[1px] border-b-white/20 border-l-[10px] ${borderClasses}`} style={{ borderLeftColor: getTagColor(tag.name) }}>
          <span className="px-1 rounded-xs text-white text-sm">{tag.name}</span>
          {!hideRelations && parentTag && (
            <div className="text-[12px] opacity-100 px-1 flex items-center gap-1">
              <span>└</span>
              {parentTag.name}
              <button className="ml-0.5 hover:opacity-100 opacity-60" onClick={handleRemoveParent}>×</button>
            </div>
          )}
          {!hideRelations && suggestedTags.map(suggestedTag => {
            return (
              <div key={suggestedTag.id} className="text-[12px] opacity-100 px-1 flex items-center gap-1">
                <span>→</span>
                {suggestedTag.name}
                <button className="ml-0.5 hover:opacity-100 opacity-60" onClick={handleRemoveSuggestedTag(suggestedTag.id)}>×</button>
              </div>
            )
          })}
          {!hideRelations && showDescription && tag.description && (
            <div className="px-1">
              <div className={`text-[12px] opacity-70 text-white ${isDescriptionExpanded ? '' : 'line-clamp-4'}`} onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>{tag.description}</div>
            </div>
          )}
        </div>
      </div>
      {showModal && !readonly && (
        <TagEditModal
          tag={tag}
          onSave={({ id, name, type, description }) => updateTag({ id, name, type, description })}
          onDelete={({ id }) => deleteTag({ id })}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default TagListItem

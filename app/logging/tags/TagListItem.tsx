'use client'
import { useState, useRef, useEffect } from 'react'
import type { Tag } from '../types'
import { getTagColor, wouldCreateCycle, getParentTag } from './tagUtils'
import TagEditor from './TagEditor'
import { useTags } from './TagsContext'

const TagListItem = ({ tag, instanceCount, usefulCount, antiUsefulCount, readonly, showDescription, hideRelations }:{ tag: Tag, instanceCount: number, usefulCount?: number, antiUsefulCount?: number, readonly?: boolean, showDescription?: boolean, hideRelations?: boolean }) => {
  const { updateTag, deleteTag, tags } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [justDropped, setJustDropped] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) } }, [])
  const parentTag = getParentTag(tag, tags)
  const suggestedTags = (tag.suggestedTagIds || []).map(id => tags.find(t => t.id === id)).filter((t): t is Tag => t !== undefined)
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
    if (draggedTag && draggedTagId !== tag.id) {
      if (draggedTag.type === tag.type) {
        if (!wouldCreateCycle(tags, draggedTagId, tag.id)) {
          await updateTag({ id: draggedTagId, parentTagId: tag.id })
        }
        return
      }
      const existingSuggestedTagIds = Array.isArray(tag.suggestedTagIds) ? tag.suggestedTagIds : []
      if (!existingSuggestedTagIds.includes(draggedTagId)) {
        await updateTag({ id: tag.id, suggestedTagIds: [...existingSuggestedTagIds, draggedTagId] })
      }
    }
    timeoutRef.current = setTimeout(() => setJustDropped(false), 100)
  }
  const handleClick = () => {
    if (readonly || justDropped) return
    setIsEditing(true)
  }
  return (
    <div
      className={`text-left w-full bg-transparent flex items-center ${dragOver ? 'bg-white/10' : ''}`}
      onClick={handleClick}
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
      <div className="flex flex-col" style={{ backgroundColor: getTagColor(tag.name), ...(usefulCount && antiUsefulCount ? { borderTop: '2px solid white', borderLeft: '2px solid white', borderBottom: '2px solid red', borderRight: '2px solid red' } : usefulCount ? { border: '2px solid white' } : antiUsefulCount ? { border: '2px solid red' } : {}) }}>
        <span className="px-1 rounded-xs text-white text-sm">{tag.name}</span>
        {!hideRelations && parentTag && <div className="text-[9px] opacity-100 px-1 flex items-center gap-1"><span>└</span>{parentTag.name}<button className="ml-0.5 hover:opacity-100 opacity-60" onClick={(e) => { e.stopPropagation(); updateTag({ id: tag.id, parentTagId: null }) }}>×</button></div>}
        {!hideRelations && suggestedTags.map(suggestedTag => {
          const existingSuggestedTagIds = Array.isArray(tag.suggestedTagIds) ? tag.suggestedTagIds : []
          return <div key={suggestedTag.id} className="text-[9px] opacity-100 px-1 flex items-center gap-1"><span>→</span>{suggestedTag.name}<button className="ml-0.5 hover:opacity-100 opacity-60" onClick={(e) => { e.stopPropagation(); updateTag({ id: tag.id, suggestedTagIds: existingSuggestedTagIds.filter(id => id !== suggestedTag.id) }) }}>×</button></div>
        })}
        {showDescription && tag.description && <div className="text-[11px] opacity-70 px-1 text-white max-w-48">{tag.description}</div>}
      </div>
    </div>
  )
}

export default TagListItem

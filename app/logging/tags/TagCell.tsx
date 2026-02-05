'use client'
import { useState } from 'react'
import TagTypeahead from './TagTypeahead'
import { useTags } from './TagsContext'
import type { TagInstance } from '../types'
import DraggableTag from './DraggableTag'
import { wouldCreateCycle, getParentTag, getAllAncestorTagIds } from './tagUtils'

const TagCell = ({ type, tagInstances, allTagInstances, datetime, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  type: string,
  tagInstances: TagInstance[],
  allTagInstances: TagInstance[],
  datetime: string,
  onCreateTagInstance: (args: { tagId: number, datetime: string, approved?: boolean }) => Promise<TagInstance>,
  onApproveTagInstance?: (args: { id: number }) => Promise<void> | void,
  onPatchTagInstance: (args: { id: number, useful?: boolean, antiUseful?: boolean }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const { tags, createTag, updateTag } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  const typeTags = tags.filter(t => t.type === type)
  const handleSetParent = (childId: number, parentId: number) => {
    const childTag = tags.find(t => t.id === childId)
    const parentTag = tags.find(t => t.id === parentId)
    if (!childTag || !parentTag) return
    if (childTag.type === parentTag.type) {
      if (wouldCreateCycle(tags, childId, parentId)) return
      updateTag({ id: childId, parentTagId: parentId })
      return
    }
    const existingSuggestedTagIds = Array.isArray(parentTag.suggestedTagIds) ? parentTag.suggestedTagIds : []
    if (existingSuggestedTagIds.includes(childId)) return
    updateTag({ id: parentId, suggestedTagIds: [...existingSuggestedTagIds, childId] })
  }

  return (
    <div className="flex items-center gap-1 min-w-0 flex-wrap">
      {[...tagInstances].sort((a, b) => a.id - b.id).map(ti => {
        const tag = ti.tag || typeTags.find(t => t.id === ti.tagId)
        if (!tag) return null
        const parentTag = getParentTag(tag, tags)
        return (
          <DraggableTag
            key={ti.id}
            tag={tag}
            parentTag={parentTag}
            ti={ti}
            onApproveTagInstance={onApproveTagInstance}
            onPatchTagInstance={onPatchTagInstance}
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
          const ancestorIds = getAllAncestorTagIds(tag, tags)
          for (const ancestorId of ancestorIds.reverse()) {
            const ancestorAlreadyExists = tagInstances.some(ti => ti.tagId === ancestorId)
            if (!ancestorAlreadyExists) {
              await onCreateTagInstance({ tagId: ancestorId, datetime })
            }
          }
          await onCreateTagInstance({ tagId: tag.id, datetime })
          const suggestedTagIds = Array.isArray(tag.suggestedTagIds) ? tag.suggestedTagIds : []
          for (const suggestedTagId of suggestedTagIds) {
            const suggestedAlreadyExists = allTagInstances.some(ti => ti.tagId === suggestedTagId && ti.datetime === datetime)
            if (!suggestedAlreadyExists) {
              await onCreateTagInstance({ tagId: suggestedTagId, datetime, approved: false })
            }
          }
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

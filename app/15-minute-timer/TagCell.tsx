'use client'
import { useState } from 'react'
import TagTypeahead from './TagTypeahead'
import { useTags } from './TagsContext'
import type { TagInstance } from './types'
import DraggableTag from './DraggableTag'
import { wouldCreateCycle, getParentTag } from './tagUtils'

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
    if (wouldCreateCycle(tags, childId, parentId)) return
    updateTag({ id: childId, parentTagId: parentId })
  }

  return (
    <div className="flex items-center gap-1 min-w-0 flex-wrap">
      {tagInstances.map(ti => {
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

'use client'
import { useState } from 'react'
import TagTypeahead from './TagTypeahead'
import type { Tag, TagInstance } from './types'

const TagCell = ({ type, tags, tagInstances, datetime, onCreateTag, onCreateTagInstance, onDeleteTagInstance }:{
  type: string,
  tags: Tag[],
  tagInstances: TagInstance[],
  datetime: string,
  onCreateTag: (args: { name: string, type: string }) => Promise<Tag>,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="flex items-center gap-1 min-w-0 flex-wrap">
      {tagInstances.map(ti => {
        const name = ti.tag?.name || tags.find(t => t.id === ti.tagId)?.name || ''
        return (
          <span key={ti.id} className="inline-flex items-center px-2 py-0.5 bg-gray-500 text-sm">
            {name}
            <button className="ml-1 text-gray-500 bg-transparent" onClick={() => onDeleteTagInstance({ id: ti.id })}>×</button>
          </span>
        )
      })}
      <TagTypeahead
        tags={tags}
        placeholder={type}
        onSelectTag={async (tag) => {
          await onCreateTagInstance({ tagId: tag.id, datetime })
          setIsEditing(false)
        }}
        onCreateTag={async (name) => {
          const created = await onCreateTag({ name, type })
          return created
        }}
      />
    </div>
  )
}

export default TagCell

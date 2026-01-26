'use client'
import { useMemo, useState } from 'react'
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
  const pills = useMemo(() => tagInstances.map(ti => ti.tag?.name || tags.find(t => t.id === ti.tagId)?.name || '').filter(Boolean), [tagInstances, tags])

  return (
    <div className="flex items-center gap-1 min-w-0">
      <button className="px-2 py-1 bg-gray-100 text-left min-w-24 max-w-48 truncate" onClick={() => setIsEditing(v => !v)} title={type}>
        {pills.length ? pills.join(', ') : type}
      </button>
      {pills.length > 0 && (
        <div className="flex gap-1">
          {tagInstances.map(ti => (
            <button key={ti.id} className="text-gray-500" onClick={() => onDeleteTagInstance({ id: ti.id })}>×</button>
          ))}
        </div>
      )}
      {isEditing && (
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
      )}
    </div>
  )
}

export default TagCell

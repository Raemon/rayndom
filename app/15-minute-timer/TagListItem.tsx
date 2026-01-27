'use client'
import { useState } from 'react'
import type { Tag } from './types'
import { getTagColor } from './TagCell'
import TagEditor from './TagEditor'
import { useTags } from './TagsContext'

const TagListItem = ({ tag, instanceCount, readonly }:{ tag: Tag, instanceCount: number, readonly?: boolean }) => {
  const { updateTag, deleteTag } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  if (isEditing && !readonly) {
    return (
      <TagEditor
        tag={tag}
        onSave={async ({ id, name, type }) => { await updateTag({ id, name, type }); setIsEditing(false) }}
        onDelete={async ({ id }) => { await deleteTag({ id }); setIsEditing(false) }}
      />
    )
  }
  return (
    <div className="text-left w-full bg-transparent flex items-center" onClick={readonly ? undefined : () => setIsEditing(true)}>
      <span className="text-gray-400 mr-1 w-8 text-center text-xs">{instanceCount}</span>
      <span className="px-1 rounded-xs text-white text-sm" style={{ backgroundColor: getTagColor(tag.name) }}>{tag.name}</span>
    </div>
  )
}

export default TagListItem

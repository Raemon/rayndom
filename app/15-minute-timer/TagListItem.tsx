'use client'
import { useState } from 'react'
import type { Tag } from './types'
import { getTagColor } from './TagCell'
import TagEditor from './TagEditor'
import { useTags } from './TagsContext'

const TagListItem = ({ tag, instanceCount }:{ tag: Tag, instanceCount: number }) => {
  const { updateTag, deleteTag } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  if (isEditing) {
    return (
      <TagEditor
        tag={tag}
        onSave={async ({ id, name, type }) => { await updateTag({ id, name, type }); setIsEditing(false) }}
        onDelete={async ({ id }) => { await deleteTag({ id }); setIsEditing(false) }}
      />
    )
  }
  return (
    <button className="text-left w-full bg-transparent flex items-center" onClick={() => setIsEditing(true)}>
      <span className="text-gray-400 mr-1 w-8 text-center text-xs">{instanceCount}</span>
      <span className="px-1 rounded-xs text-white text-sm" style={{ backgroundColor: getTagColor(tag.name) }}>{tag.name}</span>
    </button>
  )
}

export default TagListItem

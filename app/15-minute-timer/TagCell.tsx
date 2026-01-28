'use client'
import { useState } from 'react'
import TagTypeahead from './TagTypeahead'
import { useTags } from './TagsContext'
import type { TagInstance } from './types'

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
  const { tags, createTag } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  const typeTags = tags.filter(t => t.type === type)

  return (
    <div className="flex items-center gap-1 min-w-0 flex-wrap">
      {tagInstances.map(ti => {
        const name = ti.tag?.name || typeTags.find(t => t.id === ti.tagId)?.name || ''
        const isUnapproved = ti.approved === false
        const tooltipText = ti.llmReason || (isUnapproved ? 'Click to approve' : undefined)
        return (
          <span
            key={ti.id}
            className="inline-flex items-center px-2 pt-0.5 pb-0 rounded-xs text-sm text-white"
            style={{ backgroundColor: getTagColor(name), opacity: isUnapproved ? 0.5 : 1, cursor: isUnapproved ? 'pointer' : 'default' }}
            onClick={isUnapproved && onApproveTagInstance ? () => onApproveTagInstance({ id: ti.id }) : undefined}
            title={tooltipText}
          >
            {name}
            <button className="ml-2 opacity-50 cursor-pointer hover:opacity-100 text-white/60 hover:text-white bg-transparent" onClick={(e) => { e.stopPropagation(); onDeleteTagInstance({ id: ti.id }) }}>×</button>
          </span>
        )
      })}
      <TagTypeahead
        tags={typeTags}
        allTagInstances={allTagInstances}
        placeholder={type}
        onSelectTag={async (tag) => {
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

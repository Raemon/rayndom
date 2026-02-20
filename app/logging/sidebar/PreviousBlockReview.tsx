'use client'
import DraggableTag from '../tags/DraggableTag'
import { useTags } from '../tags/TagsContext'
import { getParentTag } from '../tags/tagUtils'
import type { TagInstance } from '../types'

const PreviousBlockReview = ({ timeLabel, tagInstances, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  timeLabel: string,
  tagInstances: TagInstance[],
  onApproveTagInstance: (args: { id: number }) => Promise<void> | void,
  onPatchTagInstance: (args: { id: number, useful?: boolean, antiUseful?: boolean }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const { tags } = useTags()
  if (tagInstances.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-white/60">{timeLabel} — review suggestions</div>
      <div className="flex items-center gap-1 flex-wrap">
        {tagInstances.map(ti => {
          const tag = ti.tag || tags.find(t => t.id === ti.tagId)
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
              onSetParent={() => {}}
            />
          )
        })}
      </div>
    </div>
  )
}

export default PreviousBlockReview

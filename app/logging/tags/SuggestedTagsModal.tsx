'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Tag, TagInstance } from '../types'
import { buildTagIdToCounts, getSuggestedTags, getSuggestedTagsForTag } from './tagUtils'
import TagSuggestionColumn from './TagSuggestionColumn'
import TagEditModal from './TagEditModal'
import { useTags } from './TagsContext'

type SuggestedTagsModalProps = {
  type: string
  tags: Tag[]
  allTagInstances: TagInstance[]
  datetime: string
  directSuggestions?: Tag[]
  onCreateTagInstance: (args: { tagId: number, datetime: string, approved?: boolean }) => Promise<TagInstance>
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void
  onClose: () => void
}

const SuggestedTagsModal = ({ type, tags, allTagInstances, datetime, directSuggestions = [], onCreateTagInstance, onDeleteTagInstance, onClose }: SuggestedTagsModalProps) => {
  const { updateTag, deleteTag } = useTags()
  const tagIdToCounts = useMemo(() => buildTagIdToCounts(allTagInstances), [allTagInstances])
  const suggestedTags = useMemo(() => getSuggestedTags(tags, type, tagIdToCounts), [tagIdToCounts, tags, type])
  const existingTagIdsForDatetime = useMemo(() => new Set(allTagInstances.filter(ti => ti.datetime === datetime).map(ti => ti.tagId)), [allTagInstances, datetime])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [createdTagInstanceIds, setCreatedTagInstanceIds] = useState<Map<number, number>>(new Map())
  const [hoveredTagId, setHoveredTagId] = useState<number | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const handleAddTag = useCallback(async (tag: Tag) => {
    const ti = await onCreateTagInstance({ tagId: tag.id, datetime, approved: true })
    setCreatedTagInstanceIds(prev => new Map(prev).set(tag.id, ti.id))
    setSelectedTagIds(prev => [...prev, tag.id])
  }, [datetime, onCreateTagInstance])
  const handleRemoveTag = useCallback(async (tagId: number) => {
    const instanceId = createdTagInstanceIds.get(tagId)
    if (instanceId) {
      await onDeleteTagInstance({ id: instanceId })
      setCreatedTagInstanceIds(prev => {
        const next = new Map(prev)
        next.delete(tagId)
        return next
      })
    }
    setSelectedTagIds(prev => {
      const idx = prev.indexOf(tagId)
      if (idx === -1) return prev
      return prev.slice(0, idx)
    })
  }, [createdTagInstanceIds, onDeleteTagInstance])
  const handleTagClick = useCallback(async (tag: Tag) => {
    const isSelected = selectedTagIds.includes(tag.id)
    if (isSelected) {
      await handleRemoveTag(tag.id)
    } else {
      if (existingTagIdsForDatetime.has(tag.id)) return
      await handleAddTag(tag)
    }
  }, [selectedTagIds, existingTagIdsForDatetime, handleAddTag, handleRemoveTag])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  const { suggestedColumnTags, selectedFlowColumns, hoverPreviewTags, hoverShowsFlow } = useMemo(() => {
    const showTag = (t: Tag) => !existingTagIdsForDatetime.has(t.id) || selectedTagIds.includes(t.id)
    const selectedColumns: { tagId: number, tags: Tag[], hasSuggestedTags: boolean }[] = []
    for (const tagId of selectedTagIds) {
      const tag = tags.find(t => t.id === tagId)
      if (!tag) continue
      const hasSuggestedTags = !!tag.suggestedTagIds?.length
      selectedColumns.push({ tagId, tags: hasSuggestedTags ? getSuggestedTagsForTag(tag, tags, tagIdToCounts).filter(showTag) : [], hasSuggestedTags })
    }
    let hover: Tag[] = []
    let hoverHasSuggestedTags = false
    if (hoveredTagId) {
      const lastSelectedId = selectedTagIds[selectedTagIds.length - 1]
      if (hoveredTagId !== lastSelectedId) {
        const hoveredTag = tags.find(t => t.id === hoveredTagId)
        if (hoveredTag?.suggestedTagIds?.length) {
          hoverHasSuggestedTags = true
          hover = getSuggestedTagsForTag(hoveredTag, tags, tagIdToCounts).filter(showTag)
        }
      }
    }
    return { suggestedColumnTags: suggestedTags.filter(showTag), selectedFlowColumns: selectedColumns, hoverPreviewTags: hover, hoverShowsFlow: hoverHasSuggestedTags }
  }, [suggestedTags, selectedTagIds, tags, tagIdToCounts, existingTagIdsForDatetime, hoveredTagId])
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-neutral-800 min-w-[320px] max-w-[90vw] p-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-white text-sm">Suggested tags</div>
            <button className="ml-auto text-white/30 hover:text-white text-lg leading-none cursor-pointer" onClick={onClose}>×</button>
          </div>
          <div className="flex items-start max-h-[90vh]">
            <TagSuggestionColumn tags={directSuggestions} tagIdToCounts={tagIdToCounts} onTagClick={handleTagClick} selectedTagIds={selectedTagIds} onTagHover={setHoveredTagId} onTagContextMenu={setEditingTag} className="mb-3" />
            {suggestedColumnTags.length === 0 && directSuggestions.length === 0 && !selectedFlowColumns.some(col => col.hasSuggestedTags) ? (
              <div className="text-white/50 text-xs">No tags with positive/negative uses yet.</div>
            ) : (
              <div className="flex items-start max-h-[90vh] overflow-x-auto overflow-y-auto">
                {suggestedColumnTags.length > 0 ? (
                  <div className="flex items-start flex-shrink-0">
                    <TagSuggestionColumn tags={suggestedColumnTags} tagIdToCounts={tagIdToCounts} onTagClick={handleTagClick} selectedTagIds={selectedTagIds} onTagHover={setHoveredTagId} onTagContextMenu={setEditingTag} className="w-[240px] flex-shrink-0" />
                  </div>
                ) : null}
                {selectedFlowColumns.filter(col => col.hasSuggestedTags).map(column => (
                  <div key={column.tagId} className="flex items-start flex-shrink-0">
                    {column.tags.length > 0
                      ? <TagSuggestionColumn tags={column.tags} tagIdToCounts={tagIdToCounts} onTagClick={handleTagClick} selectedTagIds={selectedTagIds} onTagHover={setHoveredTagId} onTagContextMenu={setEditingTag} className="w-[240px] flex-shrink-0" />
                      : <div className="min-w-[320px] flex-shrink-0" />}
                  </div>
                ))}
                <div className="flex items-start flex-shrink-0">
                  {hoverPreviewTags.length > 0
                    ? <TagSuggestionColumn tags={hoverPreviewTags} tagIdToCounts={tagIdToCounts} onTagClick={handleTagClick} selectedTagIds={selectedTagIds} onTagHover={setHoveredTagId} onTagContextMenu={setEditingTag} className="w-[240px] flex-shrink-0" />
                    : <div className="min-w-[320px] flex-shrink-0" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {editingTag ? <TagEditModal tag={editingTag} onSave={({ id, name, type, description }) => updateTag({ id, name, type, description })} onDelete={({ id }) => deleteTag({ id })} onClose={() => setEditingTag(null)} /> : null}
    </>
  )
}

export default SuggestedTagsModal

'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Tag, TagInstance } from '../types'
import { buildTagIdToCounts, getTagColor, getSuggestedTags, getSuggestedTagsForTag } from './tagUtils'
import TagSuggestionColumn from './TagSuggestionColumn'
import TagEditModal from './TagEditModal'
import TagTypeahead from './TagTypeahead'
import { useTags } from './TagsContext'

type SuggestedTagsModalProps = {
  type: string
  tags: Tag[]
  allTagInstances: TagInstance[]
  datetime: string
  parentTag?: Tag
  onCreateTagInstance: (args: { tagId: number, datetime: string, approved?: boolean }) => Promise<TagInstance>
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void
  onClose: () => void
}

const SuggestedTagsModal = ({ type, tags, allTagInstances, datetime, parentTag, onCreateTagInstance, onDeleteTagInstance, onClose }: SuggestedTagsModalProps) => {
  const { createTag, updateTag, deleteTag, load } = useTags()
  const tagIdToCounts = useMemo(() => buildTagIdToCounts(allTagInstances), [allTagInstances])
  const suggestedTags = useMemo(() => getSuggestedTags(tags, type, tagIdToCounts), [tagIdToCounts, tags, type])
  const existingTagIdsForDatetime = useMemo(() => new Set(allTagInstances.filter(ti => ti.datetime === datetime).map(ti => ti.tagId)), [allTagInstances, datetime])
  const liveParentTag = useMemo(() => parentTag ? (tags.find(t => t.id === parentTag.id) || parentTag) : undefined, [parentTag, tags])
  const directSuggestions = useMemo(() => {
    if (!liveParentTag) return [] as Tag[]
    const ids = Array.isArray(liveParentTag.suggestedTagIds) ? liveParentTag.suggestedTagIds : []
    return ids
      .filter(id => !existingTagIdsForDatetime.has(id))
      .map(id => tags.find(t => t.id === id))
      .filter((t): t is Tag => t !== undefined)
  }, [liveParentTag, tags, existingTagIdsForDatetime])
  const allTypes = useMemo(() => [...new Set(tags.map(t => t.type))].sort(), [tags])
  const parentSuggestedTags = useMemo(() => {
    if (!liveParentTag) return [] as Tag[]
    const ids = Array.isArray(liveParentTag.suggestedTagIds) ? liveParentTag.suggestedTagIds : []
    return ids.map(id => tags.find(t => t.id === id)).filter((t): t is Tag => t !== undefined)
  }, [liveParentTag, tags])
  const [addingForType, setAddingForType] = useState<string | null>(null)
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
        <div className="relative bg-neutral-800 min-w-[320px] max-w-[90vw] p-4" onClick={e => e.stopPropagation()}>
          <button className="ml-auto text-white/30 hover:text-white text-lg absolute top-4 right-4 leading-none cursor-pointer" onClick={onClose}>×</button>
          {liveParentTag && (
            <div className="mb-2 mr-8 text-xs">
              {allTypes.map(t => {
                const typeSuggestedTags = parentSuggestedTags.filter(st => st.type === t)
                const existingIds = new Set(liveParentTag.suggestedTagIds || [])
                return (
                  <div key={t} className="mb-1">
                    <span className="text-white/30 text-xs">{t}</span>
                    <div className="flex flex-wrap gap-1 items-center">
                      {typeSuggestedTags.map(st => (
                        <span key={st.id} className="flex items-center gap-0.5 text-xs">
                          <span className="px-1 text-white" style={{ backgroundColor: getTagColor(st.name) }}>{st.name}</span>
                          <button className="text-white/40 hover:text-white" onClick={() => updateTag({ id: liveParentTag.id, suggestedTagIds: (liveParentTag.suggestedTagIds || []).filter(id => id !== st.id) })}>×</button>
                        </span>
                      ))}
                      {addingForType === t ? (
                        <TagTypeahead
                          tags={tags.filter(tag => tag.type === t && tag.id !== liveParentTag.id && !existingIds.has(tag.id))}
                          allTagInstances={allTagInstances}
                          placeholder={`Add ${t}...`}
                          onSelectTag={async (tag) => {
                            await updateTag({ id: liveParentTag.id, suggestedTagIds: [...(liveParentTag.suggestedTagIds || []), tag.id] })
                          }}
                          onCreateTag={async (name) => createTag({ name, type: t })}
                          inputClassName="bg-gray-700 text-xs"
                          autoFocus
                          onBlur={() => setAddingForType(null)}
                        />
                      ) : (
                        <button className="text-white/30 hover:text-white text-sm leading-none cursor-pointer" onClick={() => setAddingForType(t)}>+</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-start max-h-[90vh]">
            <TagSuggestionColumn tags={directSuggestions} tagIdToCounts={tagIdToCounts} onTagClick={handleTagClick} selectedTagIds={selectedTagIds} onTagHover={setHoveredTagId} onTagContextMenu={setEditingTag} className="mb-3" />
            {suggestedColumnTags.length === 0 && directSuggestions.length === 0 && !selectedFlowColumns.some(col => col.hasSuggestedTags) ? (
              <div className="text-white/50 text-xs">No tags with positive/negative uses yet.</div>
            ) : (
              <div className="flex items-start max-h-[90vh] overflow-x-auto overflow-y-auto">
                {suggestedColumnTags.length > 0 && directSuggestions.length === 0 ? (
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
                <div className="flex items-start flex-shrink-0 min-w-[320px]">
                  {hoverPreviewTags.length > 0
                    ? <TagSuggestionColumn tags={hoverPreviewTags} tagIdToCounts={tagIdToCounts} onTagClick={handleTagClick} selectedTagIds={selectedTagIds} onTagHover={setHoveredTagId} onTagContextMenu={setEditingTag} className="w-[240px] flex-shrink-0" />
                    : <div className="min-w-[320px] flex-shrink-0" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {editingTag ? <TagEditModal tag={editingTag} onSave={async ({ id, name, type, subtype, description }) => { await updateTag({ id, name, type, subtype, description }); load() }} onDelete={async ({ id }) => { await deleteTag({ id }); load() }} onClose={() => setEditingTag(null)} /> : null}
    </>
  )
}

export default SuggestedTagsModal

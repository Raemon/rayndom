'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Tag, TagInstance } from '../types'
import { buildTagIdToCounts, getSuggestedTags, getSuggestedTagsForTag } from './tagUtils'
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
      .map(id => tags.find(t => t.id === id))
      .filter((t): t is Tag => t !== undefined)
  }, [liveParentTag, tags])
  const allTagTypes = useMemo(() => [...new Set(tags.map(t => t.type))].sort(), [tags])
  const allTypes = useMemo(() => {
    const suggestionTypes = new Set(directSuggestions.map(t => t.type))
    return allTagTypes.filter(type =>
      type.toLowerCase() !== 'projects' || suggestionTypes.has(type)
    )
  }, [allTagTypes, directSuggestions])
  const suggestedTagIds = useMemo(() => new Set(directSuggestions.map(t => t.id)), [directSuggestions])
  const [addingFor, setAddingFor] = useState<{ parentTagId: number, type: string } | null>(null)
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
  const handleAddSuggestedTagTo = useCallback((parentTag: Tag, tag: Tag) => {
    const existing = Array.isArray(parentTag.suggestedTagIds) ? parentTag.suggestedTagIds : []
    if (existing.includes(tag.id)) return
    updateTag({ id: parentTag.id, suggestedTagIds: [...existing, tag.id] })
  }, [updateTag])
  const handleRemoveSuggestedTagFrom = useCallback((parentTag: Tag, tag: Tag) => {
    updateTag({ id: parentTag.id, suggestedTagIds: (parentTag.suggestedTagIds || []).filter(id => id !== tag.id) })
  }, [updateTag])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  const { suggestedColumnTags, selectedFlowColumns, hoverPreviewTags } = useMemo(() => {
    const showTag = (t: Tag) => !existingTagIdsForDatetime.has(t.id) || selectedTagIds.includes(t.id)
    const selectedColumns: { tagId: number, parentTag: Tag, tags: Tag[], suggestedIds: Set<number>, allTypes: string[], hasSuggestedTags: boolean }[] = []
    for (const tagId of selectedTagIds) {
      const tag = tags.find(t => t.id === tagId)
      if (!tag) continue
      const hasSuggestedTags = !!tag.suggestedTagIds?.length
      if (hasSuggestedTags) {
        const allSuggestions = getSuggestedTagsForTag(tag, tags, tagIdToCounts)
        const suggestionTypes = new Set(allSuggestions.map(t => t.type))
        selectedColumns.push({
          tagId, parentTag: tag,
          tags: allSuggestions.filter(showTag),
          suggestedIds: new Set((tag.suggestedTagIds || []) as number[]),
          allTypes: allTagTypes.filter(type => type.toLowerCase() !== 'projects' || suggestionTypes.has(type)),
          hasSuggestedTags,
        })
      } else {
        selectedColumns.push({ tagId, parentTag: tag, tags: [], suggestedIds: new Set<number>(), allTypes: [], hasSuggestedTags })
      }
    }
    let hover: Tag[] = []
    if (hoveredTagId) {
      const lastSelectedId = selectedTagIds[selectedTagIds.length - 1]
      if (hoveredTagId !== lastSelectedId) {
        const hoveredTag = tags.find(t => t.id === hoveredTagId)
        if (hoveredTag?.suggestedTagIds?.length) {
          hover = getSuggestedTagsForTag(hoveredTag, tags, tagIdToCounts).filter(showTag)
        }
      }
    }
    return { suggestedColumnTags: suggestedTags.filter(showTag), selectedFlowColumns: selectedColumns, hoverPreviewTags: hover }
  }, [suggestedTags, selectedTagIds, tags, tagIdToCounts, existingTagIdsForDatetime, hoveredTagId, allTagTypes])
  const buildEditableColumnProps = (columnParentTag: Tag, columnSuggestedIds: Set<number>) => ({
    headerExtra: (type: string) => addingFor?.parentTagId === columnParentTag.id && addingFor.type === type ? (
      <TagTypeahead
        tags={tags.filter(t => t.type === type && !columnSuggestedIds.has(t.id))}
        allTagInstances={allTagInstances}
        placeholder={`Add ${type}...`}
        onSelectTag={(tag: Tag) => { handleAddSuggestedTagTo(columnParentTag, tag); setAddingFor(null) }}
        onCreateTag={async (name: string) => createTag({ name, type })}
        inputClassName="py-0 bg-gray-700 text-xs!"
        autoFocus
        onBlur={() => setAddingFor(null)}
      />
    ) : (
      <button className="text-white/30 hover:text-white text-sm leading-none cursor-pointer" onClick={() => setAddingFor({ parentTagId: columnParentTag.id, type })}>+</button>
    ),
    rowExtra: (tag: Tag) => <button className="text-white/40 hover:text-white text-xs leading-none cursor-pointer" onClick={e => { e.stopPropagation(); handleRemoveSuggestedTagFrom(columnParentTag, tag) }}>×</button>,
  })
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="relative bg-neutral-800 min-w-[320px] max-w-[90vw] p-4" onClick={e => e.stopPropagation()}>
          <button className="ml-auto text-white/30 hover:text-white text-lg absolute top-4 right-4 leading-none cursor-pointer" onClick={onClose}>×</button>
          <div className="flex h-[70vh]">
            {liveParentTag && <TagSuggestionColumn
              tags={directSuggestions}
              allTypes={allTypes}
              tagIdToCounts={tagIdToCounts}
              onTagClick={handleTagClick}
              selectedTagIds={selectedTagIds}
              onTagHover={setHoveredTagId}
              onTagContextMenu={setEditingTag}
              isTagDimmed={(tag) => existingTagIdsForDatetime.has(tag.id) && !selectedTagIds.includes(tag.id)}
              {...buildEditableColumnProps(liveParentTag, suggestedTagIds)}
              className="mb-3 overflow-y-auto"
            />}
            {suggestedColumnTags.length === 0 && directSuggestions.length === 0 && !selectedFlowColumns.some(col => col.hasSuggestedTags) ? (
              <div className="text-white/50 text-xs">No tags with positive/negative uses yet.</div>
            ) : (
              <div className="flex overflow-x-auto">
                {suggestedColumnTags.length > 0 && directSuggestions.length === 0 ? (
                  <div className="flex flex-shrink-0">
                    <TagSuggestionColumn tags={suggestedColumnTags} tagIdToCounts={tagIdToCounts} onTagClick={handleTagClick} selectedTagIds={selectedTagIds} onTagHover={setHoveredTagId} onTagContextMenu={setEditingTag} className="w-[240px] flex-shrink-0 overflow-y-auto" />
                  </div>
                ) : null}
                {selectedFlowColumns.filter(col => col.hasSuggestedTags).map(column => (
                  <div key={column.tagId} className="flex flex-shrink-0">
                    <TagSuggestionColumn
                      tags={column.tags}
                      allTypes={column.allTypes}
                      tagIdToCounts={tagIdToCounts}
                      onTagClick={handleTagClick}
                      selectedTagIds={selectedTagIds}
                      onTagHover={setHoveredTagId}
                      onTagContextMenu={setEditingTag}
                      {...buildEditableColumnProps(column.parentTag, column.suggestedIds)}
                      className="w-[240px] flex-shrink-0 overflow-y-auto"
                    />
                  </div>
                ))}
                <div className="flex flex-shrink-0 min-w-[320px]">
                  {hoverPreviewTags.length > 0
                    ? <TagSuggestionColumn tags={hoverPreviewTags} tagIdToCounts={tagIdToCounts} onTagClick={handleTagClick} selectedTagIds={selectedTagIds} onTagHover={setHoveredTagId} onTagContextMenu={setEditingTag} className="w-[240px] flex-shrink-0 overflow-y-auto" />
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

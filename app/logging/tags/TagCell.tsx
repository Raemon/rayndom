'use client'
import { useRef, useState } from 'react'
import TagTypeahead from './TagTypeahead'
import { useTags } from './TagsContext'
import type { Tag, TagInstance } from '../types'
import DraggableTag from './DraggableTag'
import { wouldCreateCycle, getParentTag, getAllAncestorTagIds } from './tagUtils'
import SuggestedTagsModal from './SuggestedTagsModal'

const TagCell = ({ type, tagInstances, allTagInstances, datetime, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  type: string,
  tagInstances: TagInstance[],
  allTagInstances: TagInstance[],
  datetime: string,
  onCreateTagInstance: (args: { tagId: number, datetime: string, approved?: boolean }) => Promise<TagInstance>,
  onApproveTagInstance?: (args: { id: number }) => Promise<void> | void,
  onPatchTagInstance: (args: { id: number, useful?: boolean, antiUseful?: boolean }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const { tags, createTag, updateTag } = useTags()
  const [isEditing, setIsEditing] = useState(false)
  const [showSuggestedTagsModal, setShowSuggestedTagsModal] = useState(false)
  const [directSuggestions, setDirectSuggestions] = useState<typeof tags>([]);
  const [pendingTagInstances, setPendingTagInstances] = useState<TagInstance[]>([])
  const typeTags = tags.filter(t => t.type === type)
  const handleSetParent = (childId: number, parentId: number) => {
    const childTag = tags.find(t => t.id === childId)
    const parentTag = tags.find(t => t.id === parentId)
    if (!childTag || !parentTag) return
    if (childTag.type === parentTag.type) {
      if (wouldCreateCycle(tags, childId, parentId)) return
      updateTag({ id: childId, parentTagId: parentId })
      return
    }
    const existingSuggestedTagIds = Array.isArray(parentTag.suggestedTagIds) ? parentTag.suggestedTagIds : []
    if (existingSuggestedTagIds.includes(childId)) return
    updateTag({ id: parentId, suggestedTagIds: [...existingSuggestedTagIds, childId] })
  }
  const visiblePendingTagInstances = pendingTagInstances.filter(pending => !tagInstances.some(existing => existing.tagId === pending.tagId))
  const visibleTagInstances = [...tagInstances, ...visiblePendingTagInstances]
  const pendingCreateKeysRef = useRef<Set<string>>(new Set())
  const buildPendingCreateKey = (tagId: number) => `${datetime}:${tagId}`
  const hasPendingCreateFor = (tagId: number) => pendingCreateKeysRef.current.has(buildPendingCreateKey(tagId))
  const addPendingCreateKey = (tagId: number) => pendingCreateKeysRef.current.add(buildPendingCreateKey(tagId))
  const removePendingCreateKey = (tagId: number) => pendingCreateKeysRef.current.delete(buildPendingCreateKey(tagId))

  return (
    <div className="flex items-center justify-start gap-1 min-w-0 flex-wrap h-full" onContextMenu={(e) => { e.preventDefault(); setShowSuggestedTagsModal(true) }}>
      {[...visibleTagInstances].sort((a, b) => a.id - b.id).map(ti => {
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
            onPatchTagInstance={onPatchTagInstance}
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
          setPendingTagInstances(prev => prev.filter(ti => ti.tag?.name !== tag.name || ti.tag?.type !== tag.type))
          const ancestorIdsInOrder = getAllAncestorTagIds(tag, tags).reverse()
          for (const ancestorId of ancestorIdsInOrder) {
            const ancestorAlreadyExists = tagInstances.some(ti => ti.tagId === ancestorId) || hasPendingCreateFor(ancestorId)
            if (!ancestorAlreadyExists) {
              addPendingCreateKey(ancestorId)
              try {
                await onCreateTagInstance({ tagId: ancestorId, datetime })
              } catch (error) {
                console.error('Failed to create ancestor tag instance:', error)
              } finally {
                removePendingCreateKey(ancestorId)
              }
            }
          }
          const selectedTagAlreadyExists = tagInstances.some(ti => ti.tagId === tag.id) || hasPendingCreateFor(tag.id)
          if (!selectedTagAlreadyExists) {
            addPendingCreateKey(tag.id)
            try {
              await onCreateTagInstance({ tagId: tag.id, datetime })
            } catch (error) {
              console.error('Failed to create tag instance:', error)
            } finally {
              removePendingCreateKey(tag.id)
            }
          }
          const suggestedTagIds = Array.isArray(tag.suggestedTagIds) ? tag.suggestedTagIds : []
          const suggestedTagsToOffer = suggestedTagIds
            .filter(id => !allTagInstances.some(ti => ti.tagId === id && ti.datetime === datetime))
            .map(id => tags.find(t => t.id === id))
            .filter((t): t is typeof tags[number] => t !== undefined)
          if (suggestedTagsToOffer.length > 0) {
            setDirectSuggestions(suggestedTagsToOffer)
            setShowSuggestedTagsModal(true)
          }
          setIsEditing(false)
        }}
        onCreateTag={async (name) => {
          const pendingTag: Tag = { id: -Date.now(), name, type }
          const pendingTagInstance: TagInstance = { id: pendingTag.id, tagId: pendingTag.id, datetime, llmPredicted: false, approved: true, tag: pendingTag }
          setPendingTagInstances(prev => [...prev, pendingTagInstance])
          try {
            const created = await createTag({ name, type })
            setPendingTagInstances(prev => prev.map(ti => ti.tagId === pendingTag.id ? { ...ti, tagId: created.id, tag: created } : ti))
            return created
          } catch (error) {
            setPendingTagInstances(prev => prev.filter(ti => ti.tagId !== pendingTag.id))
            throw error
          }
        }}
      />
      {showSuggestedTagsModal && <SuggestedTagsModal type={type} tags={tags} allTagInstances={allTagInstances} datetime={datetime} directSuggestions={directSuggestions} onCreateTagInstance={onCreateTagInstance} onDeleteTagInstance={onDeleteTagInstance} onClose={() => { setShowSuggestedTagsModal(false); setDirectSuggestions([]) }} />}
    </div>
  )
}

export default TagCell

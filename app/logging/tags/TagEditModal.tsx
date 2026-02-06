'use client'
import { useEffect, useMemo, useState } from 'react'
import groupBy from 'lodash/groupBy'
import type { Tag } from '../types'
import TagEditor from './TagEditor'
import { useTags } from './TagsContext'
import Link from 'next/link'
import { getTagColor, getParentTag, wouldCreateCycle } from './tagUtils'

const TagPicker = ({ tags, placeholder, onSelect }:{ tags: Tag[], placeholder: string, onSelect: (tag: Tag) => void }) => {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? tags.filter(t => t.name.toLowerCase().includes(q)) : tags
    return filtered.slice(0, 8)
  }, [query, tags])
  return (
    <div className="relative">
      <input className="px-2 py-1 bg-gray-700 outline-none w-full text-xs!" value={query} onChange={e => { setQuery(e.target.value) }} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} placeholder={placeholder} />
      {focused && matches.length > 0 && (
        <div className="absolute z-10 mt-1 bg-gray-900 text-white text-xs max-h-[120px] overflow-y-auto">
          {matches.map(t => (
            <button key={t.id} className="block text-left px-2 py-1 w-full hover:bg-white/10 cursor-pointer" onMouseDown={e => { e.preventDefault(); onSelect(t); setQuery('') }}>
              <span className="px-1 text-white" style={{ backgroundColor: getTagColor(t.name) }}>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const TagEditModal = ({ tag: initialTag, onSave, onDelete, onClose }:{ tag: Tag, onSave: (args: { id: number, name: string, type: string, description: string | null }) => Promise<void> | void, onDelete: (args: { id: number }) => Promise<void> | void, onClose: () => void }) => {
  const { tags, updateTag } = useTags()
  const tag = tags.find(t => t.id === initialTag.id) || initialTag
  const parentTag = getParentTag(tag, tags)
  const suggestedTags = useMemo(() => (tag.suggestedTagIds || []).map(id => tags.find(t => t.id === id)).filter((t): t is Tag => t !== undefined), [tag.suggestedTagIds, tags])
  const sameTypeTags = useMemo(() => tags.filter(t => t.type === tag.type && t.id !== tag.id), [tags, tag])
  const allOtherTags = useMemo(() => tags.filter(t => t.id !== tag.id), [tags, tag])
  const availableSuggestedTags = useMemo(() => {
    const existingIds = new Set(tag.suggestedTagIds || [])
    return allOtherTags.filter(t => !existingIds.has(t.id))
  }, [allOtherTags, tag.suggestedTagIds])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-gray-800 p-4 min-w-[300px] max-w-[600px]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 text-white text-sm" style={{ backgroundColor: getTagColor(tag.name) }}>{tag.name}</span>
          <span className="text-white/40 text-xs">{tag.type}</span>
          <Link href={`/logging/tag/${tag.id}`} className="ml-auto text-white/30 hover:text-white cursor-pointer" title="Open tag page">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </Link>
          <button className="text-white/30 hover:text-white text-lg leading-none cursor-pointer" onClick={onClose}>×</button>
        </div>
        <TagEditor
          tag={tag}
          onSave={(args) => { onSave(args); onClose() }}
          onDelete={(args) => { onDelete(args); onClose() }}
          onCancel={onClose}
        />
        <div className="mt-3 flex flex-col gap-2">
          <div>
            <div className="text-white/50 text-[10px] mb-1">Parent tag</div>
            {parentTag ? (
              <div className="flex items-center gap-1 text-xs">
                <span className="px-1 text-white" style={{ backgroundColor: getTagColor(parentTag.name) }}>{parentTag.name}</span>
                <button className="text-white/40 hover:text-white" onClick={() => updateTag({ id: tag.id, parentTagId: null })}>×</button>
              </div>
            ) : (
              <TagPicker tags={sameTypeTags.filter(t => !wouldCreateCycle(tags, tag.id, t.id))} placeholder="Set parent..." onSelect={t => updateTag({ id: tag.id, parentTagId: t.id })} />
            )}
          </div>
          <div>
            <div className="text-white/50 text-[10px] mb-1">Suggested tags</div>
            {Object.entries(groupBy(suggestedTags, 'type')).map(([type, typeTags]) => (
              <div key={type} className="mb-1">
                <span className="text-white/30 text-[10px]">{type}</span>
                <div className="flex flex-wrap gap-1">
                  {typeTags.map(st => (
                    <span key={st.id} className="flex items-center gap-0.5 text-xs">
                      <span className="px-1 text-white" style={{ backgroundColor: getTagColor(st.name) }}>{st.name}</span>
                      <button className="text-white/40 hover:text-white" onClick={() => updateTag({ id: tag.id, suggestedTagIds: (tag.suggestedTagIds || []).filter(id => id !== st.id) })}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <TagPicker tags={availableSuggestedTags} placeholder="Add suggested..." onSelect={t => updateTag({ id: tag.id, suggestedTagIds: [...(tag.suggestedTagIds || []), t.id] })} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TagEditModal

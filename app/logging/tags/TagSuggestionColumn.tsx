'use client'
import { useState } from 'react'
import type { Tag, TagInstance } from '../types'
import { sortTagsByCounts, type TagCounts } from './tagUtils'
import SuggestedTagRow from './SuggestedTagRow'
import TagTypeahead from './TagTypeahead'

const TagSuggestionColumn = ({ tags, allTypes, allTags, allTagInstances, tagIdToCounts, onTagClick, onAddSuggestedTag, onRemoveSuggestedTag, onCreateTag, selectedTagIds, onTagHover, onTagContextMenu, className }: {
  tags: Tag[],
  allTypes?: string[],
  allTags?: Tag[],
  allTagInstances?: TagInstance[],
  tagIdToCounts?: Map<number, TagCounts>,
  onTagClick?: (tag: Tag) => void,
  onAddSuggestedTag?: (tag: Tag, type: string) => void,
  onRemoveSuggestedTag?: (tag: Tag) => void,
  onCreateTag?: (name: string, type: string) => Promise<Tag>,
  selectedTagIds?: number[],
  onTagHover?: (tagId: number | null) => void,
  onTagContextMenu?: (tag: Tag) => void,
  className?: string,
}) => {
  const [addingForType, setAddingForType] = useState<string | null>(null)
  const suggestionsByTypeAndSubtype: Record<string, Record<string, Tag[]>> = {}
  for (const tag of tags) {
    if (!suggestionsByTypeAndSubtype[tag.type]) suggestionsByTypeAndSubtype[tag.type] = {}
    const subtype = tag.subtype || ''
    if (!suggestionsByTypeAndSubtype[tag.type][subtype]) suggestionsByTypeAndSubtype[tag.type][subtype] = []
    suggestionsByTypeAndSubtype[tag.type][subtype].push(tag)
  }
  const typesToShow = allTypes ?? Object.keys(suggestionsByTypeAndSubtype)
  const countsMap = tagIdToCounts ?? new Map<number, TagCounts>()
  const selectedSet = new Set(selectedTagIds ?? [])
  const existingTagIds = new Set(tags.map(t => t.id))
  if (tags.length === 0 && !allTypes) return null
  return (
    <div className={`flex min-w-[200px] max-w-[90vw] pr-12 flex-col gap-1${className ? ` ${className}` : ''}`}>
      {typesToShow.map(type => {
        const subtypeToTags = suggestionsByTypeAndSubtype[type] || {}
        const hasTags = Object.values(subtypeToTags).some(arr => arr.length > 0)
        return (
          <div key={type} className="flex flex-col">
            <div className="flex items-center gap-1 my-4">
              <span className="underline text-white/60">{type}</span>
              {onAddSuggestedTag && (
                addingForType === type ? (
                  <TagTypeahead
                    tags={(allTags || []).filter(t => t.type === type && !existingTagIds.has(t.id))}
                    allTagInstances={allTagInstances}
                    placeholder={`Add ${type}...`}
                    onSelectTag={(tag) => { onAddSuggestedTag(tag, type); setAddingForType(null) }}
                    onCreateTag={async (name) => {
                      const created = await onCreateTag!(name, type)
                      return created
                    }}
                    inputClassName="py-0 bg-gray-700 text-xs!"
                    autoFocus
                    onBlur={() => setAddingForType(null)}
                  />
                ) : (
                  <button className="text-white/30 hover:text-white text-sm leading-none cursor-pointer" onClick={() => setAddingForType(type)}>+</button>
                )
              )}
            </div>
            {hasTags && Object.entries(subtypeToTags).sort(([a], [b]) => (a || '').localeCompare(b || '')).map(([subtype, subtypeTags]) => (
              <div key={`${type}-${subtype}`} className="flex flex-col">
                {subtype ? <div className="text-xs text-white/40 my-2 ml-1">{subtype}</div> : null}
                {sortTagsByCounts(subtypeTags, countsMap).map(tag => (
                  <SuggestedTagRow key={tag.id} tag={tag} counts={tagIdToCounts?.get(tag.id)} onClick={() => onTagClick?.(tag)} onRemove={onRemoveSuggestedTag ? () => onRemoveSuggestedTag(tag) : undefined} isSelected={selectedSet.has(tag.id)} onMouseEnter={() => onTagHover?.(tag.id)} onMouseLeave={() => onTagHover?.(null)} onContextMenu={() => onTagContextMenu?.(tag)} />
                ))}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default TagSuggestionColumn

'use client'
import type { Tag } from '../types'
import { sortTagsByCounts, type TagCounts } from './tagUtils'
import SuggestedTagRow from './SuggestedTagRow'

const TagSuggestionColumn = ({ tags, tagIdToCounts, onTagClick, selectedTagIds, onTagHover, onTagContextMenu, className }:{
  tags: Tag[],
  tagIdToCounts?: Map<number, TagCounts>,
  onTagClick?: (tag: Tag) => void,
  selectedTagIds?: number[],
  onTagHover?: (tagId: number | null) => void,
  onTagContextMenu?: (tag: Tag) => void,
  className?: string,
}) => {
  if (tags.length === 0) return null
  const suggestionsByTypeAndSubtype: Record<string, Record<string, Tag[]>> = {}
  for (const tag of tags) {
    if (!suggestionsByTypeAndSubtype[tag.type]) suggestionsByTypeAndSubtype[tag.type] = {}
    const subtype = tag.subtype || ''
    if (!suggestionsByTypeAndSubtype[tag.type][subtype]) suggestionsByTypeAndSubtype[tag.type][subtype] = []
    suggestionsByTypeAndSubtype[tag.type][subtype].push(tag)
  }
  const countsMap = tagIdToCounts ?? new Map<number, TagCounts>()
  const selectedSet = new Set(selectedTagIds ?? [])
  return (
    <div className={`flex min-w-[200px] max-w-[90vw] pr-12 flex-col gap-1${className ? ` ${className}` : ''}`}>
      {Object.entries(suggestionsByTypeAndSubtype).map(([type, subtypeToTags]) => (
        <div key={type} className="flex flex-col">
          <div className="underline text-white/60 my-4">{type}</div>
          {Object.entries(subtypeToTags).sort(([a], [b]) => (a || '').localeCompare(b || '')).map(([subtype, subtypeTags]) => (
            <div key={`${type}-${subtype}`} className="flex flex-col">
              {subtype ? <div className="text-xs text-white/40 my-2 ml-1">{subtype}</div> : null}
              {sortTagsByCounts(subtypeTags, countsMap).map(tag => (
                <SuggestedTagRow key={tag.id} tag={tag} counts={tagIdToCounts?.get(tag.id)} onClick={() => onTagClick?.(tag)} isSelected={selectedSet.has(tag.id)} onMouseEnter={() => onTagHover?.(tag.id)} onMouseLeave={() => onTagHover?.(null)} onContextMenu={() => onTagContextMenu?.(tag)} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default TagSuggestionColumn

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
  const suggestionsByType: Record<string, Tag[]> = {}
  for (const tag of tags) {
    if (!suggestionsByType[tag.type]) suggestionsByType[tag.type] = []
    suggestionsByType[tag.type].push(tag)
  }
  const countsMap = tagIdToCounts ?? new Map<number, TagCounts>()
  const selectedSet = new Set(selectedTagIds ?? [])
  return (
    <div className={`flex min-w-[320px] max-w-[90vw] pr-12 flex-col gap-1${className ? ` ${className}` : ''}`}>
      {Object.entries(suggestionsByType).map(([type, typedTags]) => (
        <div key={type} className="flex flex-col">
          <div className="text-sm text-white/60 my-4">{type}</div>
          {sortTagsByCounts(typedTags, countsMap).map(tag => (
            <SuggestedTagRow key={tag.id} tag={tag} counts={tagIdToCounts?.get(tag.id)} onClick={() => onTagClick?.(tag)} isSelected={selectedSet.has(tag.id)} onMouseEnter={() => onTagHover?.(tag.id)} onMouseLeave={() => onTagHover?.(null)} onContextMenu={() => onTagContextMenu?.(tag)} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default TagSuggestionColumn

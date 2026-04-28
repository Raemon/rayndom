'use client'
import type { ReactNode } from 'react'
import type { Tag } from '../types'
import { sortTagsByCounts, type TagCounts } from './tagUtils'
import SuggestedTagRow from './SuggestedTagRow'

const TagSuggestionColumn = ({ tags, allTypes, tagIdToCounts, onTagClick, selectedTagIds, onTagHover, onTagContextMenu, headerExtra, rowExtra, isTagDimmed, className }: {
  tags: Tag[],
  allTypes?: string[],
  tagIdToCounts?: Map<number, TagCounts>,
  onTagClick?: (tag: Tag) => void,
  selectedTagIds?: number[],
  onTagHover?: (tagId: number | null) => void,
  onTagContextMenu?: (tag: Tag) => void,
  headerExtra?: (type: string) => ReactNode,
  rowExtra?: (tag: Tag) => ReactNode,
  isTagDimmed?: (tag: Tag) => boolean,
  className?: string,
}) => {
  const suggestionsByTypeAndSubtype: Record<string, Record<string, Tag[]>> = {}
  for (const tag of tags) {
    if (!suggestionsByTypeAndSubtype[tag.type]) suggestionsByTypeAndSubtype[tag.type] = {}
    const subtype = tag.subtype || ''
    if (!suggestionsByTypeAndSubtype[tag.type][subtype]) suggestionsByTypeAndSubtype[tag.type][subtype] = []
    suggestionsByTypeAndSubtype[tag.type][subtype].push(tag)
  }
  const typesToShow = allTypes ?? Object.keys(suggestionsByTypeAndSubtype)
  if (tags.length === 0 && !allTypes) return null
  const countsMap = tagIdToCounts ?? new Map<number, TagCounts>()
  const selectedSet = new Set(selectedTagIds ?? [])
  return (
    <div className={`flex min-w-[200px] max-w-[90vw] pr-12 flex-col gap-1${className ? ` ${className}` : ''}`}>
      {typesToShow.map(type => {
        const subtypeToTags = suggestionsByTypeAndSubtype[type] || {}
        const hasTags = Object.values(subtypeToTags).some(arr => arr.length > 0)
        return (
          <div key={type} className="flex flex-col">
            <div className="flex items-center gap-1 my-4">
              <span className="underline text-white/60">{type}</span>
              {headerExtra?.(type)}
            </div>
            {hasTags && Object.entries(subtypeToTags).sort(([a], [b]) => (a || '').localeCompare(b || '')).map(([subtype, subtypeTags]) => (
              <div key={`${type}-${subtype}`} className="flex flex-col">
                {subtype ? <div className="text-xs text-white/40 my-2 ml-1">{subtype}</div> : null}
                {sortTagsByCounts(subtypeTags, countsMap).map(tag => (
                  <SuggestedTagRow key={tag.id} tag={tag} counts={tagIdToCounts?.get(tag.id)} onClick={onTagClick ? () => onTagClick(tag) : undefined} isSelected={selectedSet.has(tag.id)} dimmed={isTagDimmed?.(tag)} onMouseEnter={() => onTagHover?.(tag.id)} onMouseLeave={() => onTagHover?.(null)} onContextMenu={() => onTagContextMenu?.(tag)} extra={rowExtra?.(tag)} />
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

'use client'
import type { Tag } from '../types'
import { sortTagsByCounts, type TagCounts } from './tagUtils'
import SuggestedTagRow from './SuggestedTagRow'

const DirectSuggestionsList = ({ directSuggestions, tagIdToCounts, onAddTag }:{
  directSuggestions: Tag[],
  tagIdToCounts?: Map<number, TagCounts>,
  onAddTag?: (tag: Tag) => void,
}) => {
  if (directSuggestions.length === 0) return null
  const suggestionsByType: Record<string, Tag[]> = {}
  const directSuggestionsInDisplayOrder = directSuggestions
  for (const suggestedTag of directSuggestionsInDisplayOrder) {
    if (!suggestionsByType[suggestedTag.type]) suggestionsByType[suggestedTag.type] = []
    suggestionsByType[suggestedTag.type].push(suggestedTag)
  }
  const countsMap = tagIdToCounts ?? new Map<number, TagCounts>()
  return (
    <div className="flex flex-col gap-1 mb-3">
      {Object.entries(suggestionsByType).map(([type, typedSuggestions]) => (
        <div key={type} className="flex flex-col">
          <div className="text-sm text-white/60 my-4">{type}</div>
          {sortTagsByCounts(typedSuggestions, countsMap).map(tag => (
            <SuggestedTagRow key={tag.id} tag={tag} counts={tagIdToCounts?.get(tag.id)} onClick={() => onAddTag?.(tag)} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default DirectSuggestionsList

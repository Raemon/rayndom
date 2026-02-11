'use client'
import type { Tag } from '../types'
import SuggestedTagRow from './SuggestedTagRow'

const DirectSuggestionsList = ({ directSuggestions, onAddTag }:{
  directSuggestions: Tag[],
  onAddTag?: (tag: Tag) => void,
}) => {
  if (directSuggestions.length === 0) return null
  return (
    <div className="flex flex-col gap-1 mb-3">
      <div className="text-white/40 text-xs">From selected tag</div>
      {directSuggestions.map(tag => (
        <SuggestedTagRow key={tag.id} tag={tag} onClick={() => onAddTag?.(tag)} />
      ))}
    </div>
  )
}

export default DirectSuggestionsList

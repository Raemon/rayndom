'use client'
import { useEffect, useMemo } from 'react'
import type { Tag, TagInstance } from '../types'
import { buildTagIdToCounts, getSuggestedTags } from './tagUtils'
import DirectSuggestionsList from './DirectSuggestionsList'
import SuggestedTagRow from './SuggestedTagRow'

type SuggestedTagsModalProps = {
  type: string
  tags: Tag[]
  allTagInstances: TagInstance[]
  directSuggestions?: Tag[]
  onAddTag?: (tag: Tag) => void
  onClose: () => void
}

const SuggestedTagsModal = ({ type, tags, allTagInstances, directSuggestions = [], onAddTag, onClose }: SuggestedTagsModalProps) => {
  const tagIdToCounts = useMemo(() => buildTagIdToCounts(allTagInstances), [allTagInstances])
  const suggestedTags = useMemo(() => getSuggestedTags(tags, type, tagIdToCounts), [tagIdToCounts, tags, type])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-gray-800 p-4 min-w-[320px] max-w-[600px]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-white text-sm">Suggested tags</div>
          <div className="text-white/40 text-xs">{type}</div>
          <button className="ml-auto text-white/30 hover:text-white text-lg leading-none cursor-pointer" onClick={onClose}>×</button>
        </div>
        <DirectSuggestionsList directSuggestions={directSuggestions} onAddTag={onAddTag} />
        {suggestedTags.length === 0 && directSuggestions.length === 0 ? (
          <div className="text-white/50 text-xs">No tags with positive/negative uses yet.</div>
        ) : (
          <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto">
            {suggestedTags.map(tag => {
              const counts = tagIdToCounts.get(tag.id) || { positive: 0, negative: 0 }
              return <SuggestedTagRow key={tag.id} tag={tag} counts={counts} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SuggestedTagsModal

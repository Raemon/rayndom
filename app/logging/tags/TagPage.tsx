'use client'
import { useMemo, useState } from 'react'
import groupBy from 'lodash/groupBy'
import countBy from 'lodash/countBy'
import orderBy from 'lodash/orderBy'
import TagListItem from './TagListItem'
import { useTagInstances } from '../hooks/useTagInstances'
import { TagsProvider, useTags } from './TagsContext'
import type { Tag } from '../types'
import { allTagInstancesStartIso, allTagInstancesEndIso } from '../tagInstanceConstants'

const typeNames = ["Projects", "Triggers", "Techniques"] as const
const sortOptions = ['useful', 'antiuseful', 'used-at-all'] as const
type SortOption = typeof sortOptions[number]

const TagPageInner = ({}:{}) => {
  const { tags } = useTags()
  const [showDescriptions, setShowDescriptions] = useState(true)
  const [sortByByType, setSortByByType] = useState<Record<string, SortOption>>(() => Object.fromEntries(typeNames.map(typeName => [typeName, 'useful'])) as Record<string, SortOption>)
  const { tagInstances } = useTagInstances({ start: allTagInstancesStartIso, end: allTagInstancesEndIso })
  const instanceCountByTagId = useMemo(() => countBy(tagInstances, 'tagId'), [tagInstances])
  const usefulCountByTagId = useMemo(() => countBy(tagInstances.filter(tagInstance => tagInstance.useful), 'tagId'), [tagInstances])
  const antiUsefulCountByTagId = useMemo(() => countBy(tagInstances.filter(tagInstance => tagInstance.antiUseful), 'tagId'), [tagInstances])
  const tagsByType = useMemo(() => groupBy(tags, 'type'), [tags])
  const sortedTagsByType = useMemo(() => Object.fromEntries(typeNames.map(typeName => {
    const tagsForType = tagsByType[typeName] || []
    const tagCountPairs = tagsForType.map(tag => ({ tag, count: instanceCountByTagId[tag.id] || 0, usefulCount: usefulCountByTagId[tag.id] || 0, antiUsefulCount: antiUsefulCountByTagId[tag.id] || 0 }))
    const sortBy = sortByByType[typeName]
    const sortedPairs = sortBy === 'antiuseful'
      ? orderBy(tagCountPairs, [pair => pair.antiUsefulCount, pair => pair.count, pair => pair.tag.name.toLowerCase()], ['desc', 'desc', 'asc'])
      : sortBy === 'used-at-all'
        ? orderBy(tagCountPairs, [pair => pair.count, pair => pair.usefulCount, pair => pair.tag.name.toLowerCase()], ['desc', 'desc', 'asc'])
        : orderBy(tagCountPairs, [pair => pair.usefulCount, pair => pair.count, pair => pair.tag.name.toLowerCase()], ['desc', 'desc', 'asc'])
    return [typeName, sortedPairs]
  })), [tagsByType, instanceCountByTagId, usefulCountByTagId, antiUsefulCountByTagId, sortByByType])

  return (
    <div className="p-4 text-sm">
      <label className="flex items-center gap-2 mb-4 text-white/70 text-xs cursor-pointer">
        <input type="checkbox" checked={showDescriptions} onChange={(e) => setShowDescriptions(e.target.checked)} />
        Show descriptions
      </label>
      <div className="flex gap-6 items-start">
        {typeNames.map(typeName => (
          <div key={typeName} className="w-1/3 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-lg text-white">{typeName}</div>
              <label className="flex items-center gap-1 text-[11px] text-white/60 whitespace-nowrap">
                sort by
                <select
                  value={sortByByType[typeName]}
                  onChange={(e) => setSortByByType(prev => ({ ...prev, [typeName]: e.target.value as SortOption }))}
                  className="bg-transparent text-white text-[11px]"
                >
                  {sortOptions.map(sortOption => <option key={sortOption} value={sortOption} className="bg-gray-900">{sortOption}</option>)}
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-1">
              {sortedTagsByType[typeName]?.map(({ tag, count, usefulCount, antiUsefulCount }:{ tag: Tag, count: number, usefulCount: number, antiUsefulCount: number }) => (
                <TagListItem key={tag.id} tag={tag} instanceCount={count} usefulCount={usefulCount} antiUsefulCount={antiUsefulCount} showZeroFeedbackCounts showDescription={showDescriptions} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const TagPage = ({}:{}) => (
  <TagsProvider>
    <TagPageInner />
  </TagsProvider>
)

export default TagPage

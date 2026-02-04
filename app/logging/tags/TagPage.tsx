'use client'
import { useMemo, useState } from 'react'
import groupBy from 'lodash/groupBy'
import countBy from 'lodash/countBy'
import orderBy from 'lodash/orderBy'
import TagListItem from './TagListItem'
import { useTagInstances } from '../hooks/useTagInstances'
import { TagsProvider, useTags } from './TagsContext'
import type { Tag } from '../types'

const TagPageInner = ({}:{}) => {
  const { tags } = useTags()
  const [showDescriptions, setShowDescriptions] = useState(false)
  const startIso = new Date(2000, 0, 1).toISOString()
  const endIso = new Date(2100, 0, 1).toISOString()
  const { tagInstances } = useTagInstances({ start: startIso, end: endIso })
  const instanceCountByTagId = useMemo(() => countBy(tagInstances, 'tagId'), [tagInstances])
  const tagsByType = useMemo(() => groupBy(tags, 'type'), [tags])
  const typeNames = ["Projects", "Triggers", "Techniques"]
  const sortedTagsByType = useMemo(() => Object.fromEntries(typeNames.map(typeName => {
    const tagsForType = tagsByType[typeName] || []
    const tagCountPairs = tagsForType.map(tag => ({ tag, count: instanceCountByTagId[tag.id] || 0 }))
    const sortedPairs = orderBy(tagCountPairs, [pair => pair.count, pair => pair.tag.name.toLowerCase()], ['desc', 'asc'])
    return [typeName, sortedPairs]
  })), [typeNames, tagsByType, instanceCountByTagId])

  return (
    <div className="p-4 text-sm">
      <label className="flex items-center gap-2 mb-4 text-white/70 text-xs cursor-pointer">
        <input type="checkbox" checked={showDescriptions} onChange={(e) => setShowDescriptions(e.target.checked)} />
        Show descriptions
      </label>
      <div className="flex gap-6 items-start">
        {typeNames.map(typeName => (
          <div key={typeName} className="flex-1 min-w-0">
            <div className="text-lg text-white mb-2">{typeName}</div>
            <div className="flex flex-col gap-1">
              {sortedTagsByType[typeName]?.map(({ tag, count }:{ tag: Tag, count: number }) => (
                <TagListItem key={tag.id} tag={tag} instanceCount={count} showDescription={showDescriptions} />
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

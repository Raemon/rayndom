import { useMemo } from 'react'
import { countBy, orderBy } from 'lodash'
import type { Tag, TagInstance } from '../types'

export type TagCount = { tag: Tag, count: number, usefulCount: number, antiUsefulCount: number }

// Aggregate a section's tag instances into per-type, sorted lists for the collapsed summary
// (useful tags first, then anti-useful, then by raw count). Shared by the month/week/day sections.
export const useCollapsedTagCounts = (tagInstances: TagInstance[], tags: Tag[], tagTypes: string[]): Record<string, TagCount[]> =>
  useMemo(() => {
    const counts = countBy(tagInstances, ti => ti.tagId)
    const usefulCounts = countBy(tagInstances.filter(ti => ti.useful), ti => ti.tagId)
    const antiUsefulCounts = countBy(tagInstances.filter(ti => ti.antiUseful), ti => ti.tagId)
    const tagCountPairs = Object.entries(counts).map(([tagId, count]) => {
      const tag = tags.find(t => t.id === Number(tagId))
      return { tag, count, usefulCount: usefulCounts[tagId] || 0, antiUsefulCount: antiUsefulCounts[tagId] || 0 }
    }).filter((pair): pair is TagCount => pair.tag !== undefined)
    const sorted = orderBy(tagCountPairs, [p => p.usefulCount > 0 ? 2 : p.antiUsefulCount > 0 ? 1 : 0, 'count'], ['desc', 'desc'])
    const byType: Record<string, TagCount[]> = {}
    for (const type of tagTypes) byType[type] = []
    for (const pair of sorted) {
      const type = pair.tag.type
      if (byType[type]) byType[type].push(pair)
    }
    return byType
  }, [tagInstances, tags, tagTypes])

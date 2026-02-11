import type { Tag, TagInstance } from '../types'

export type TagCounts = { positive: number, negative: number }

export const buildTagIdToCounts = (allTagInstances: TagInstance[]): Map<number, TagCounts> => {
  const counts = new Map<number, TagCounts>()
  const positiveOrNegativeTagInstances = allTagInstances.filter(ti => ti.useful || ti.antiUseful)
  for (const tagInstance of positiveOrNegativeTagInstances) {
    const currentCounts = counts.get(tagInstance.tagId) || { positive: 0, negative: 0 }
    if (tagInstance.useful) currentCounts.positive += 1
    if (tagInstance.antiUseful) currentCounts.negative += 1
    counts.set(tagInstance.tagId, currentCounts)
  }
  return counts
}

export const getSuggestedTags = (tags: Tag[], type: string, tagIdToCounts: Map<number, TagCounts>): Tag[] => {
  return tags
    .filter(tag => {
      if (tag.type !== type) return false
      const counts = tagIdToCounts.get(tag.id)
      return !!counts && (counts.positive > 0 || counts.negative > 0)
    })
    .sort((a, b) => {
      const aCounts = tagIdToCounts.get(a.id) || { positive: 0, negative: 0 }
      const bCounts = tagIdToCounts.get(b.id) || { positive: 0, negative: 0 }
      const aNet = aCounts.positive - aCounts.negative
      const bNet = bCounts.positive - bCounts.negative
      if (bNet !== aNet) return bNet - aNet
      const aTotal = aCounts.positive + aCounts.negative
      const bTotal = bCounts.positive + bCounts.negative
      if (bTotal !== aTotal) return bTotal - aTotal
      if (bCounts.positive !== aCounts.positive) return bCounts.positive - aCounts.positive
      return a.name.localeCompare(b.name)
    })
}

export const getTagColor = (name: string): string => {
  const lower = name.toLowerCase()
  let hue = 0
  let range = 360
  const charCount = Math.min(lower.length, 4)
  for (let i = 0; i < charCount; i++) {
    const code = lower.charCodeAt(i)
    const position = code >= 97 && code <= 122 ? (code - 97) / 26 : (code % 26) / 26
    hue += position * range
    range /= 26
  }
  return `hsl(${Math.floor(hue)}, 50%, 35%)`
}

export const wouldCreateCycle = (tags: Tag[], childId: number, newParentId: number): boolean => {
  let currentId: number | null | undefined = newParentId
  const visited = new Set<number>()
  while (currentId) {
    if (currentId === childId) return true
    if (visited.has(currentId)) return false
    visited.add(currentId)
    const parentTag = tags.find(t => t.id === currentId)
    currentId = parentTag?.parentTagId
  }
  return false
}

export const getParentTag = (tag: Tag, tags: Tag[]): Tag | null => {
  return tag.parentTag || (tag.parentTagId ? tags.find(t => t.id === tag.parentTagId) : null) || null
}

export const getAllAncestorTagIds = (tag: Tag, tags: Tag[]): number[] => {
  const ancestorIds: number[] = []
  const visited = new Set<number>()
  let currentId: number | null | undefined = tag.parentTagId
  while (currentId) {
    if (visited.has(currentId)) break
    visited.add(currentId)
    ancestorIds.push(currentId)
    const parentTag = tags.find(t => t.id === currentId)
    currentId = parentTag?.parentTagId
  }
  return ancestorIds
}

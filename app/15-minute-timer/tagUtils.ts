import type { Tag } from './types'

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

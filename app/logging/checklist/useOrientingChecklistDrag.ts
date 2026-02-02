import { type DragEvent } from 'react'
import type { SectionKey } from '../types'

export const beginDrag = (e: DragEvent, id: number, section: SectionKey) => {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', JSON.stringify({ id, section }))
}

export const parseDrag = (e: DragEvent): { id: number, section: SectionKey } | null => {
  try {
    const raw = e.dataTransfer.getData('text/plain')
    const parsed = JSON.parse(raw)
    if (typeof parsed?.id !== 'number') return null
    if (parsed?.section !== 'morning' && parsed?.section !== 'afternoon' && parsed?.section !== 'evening' && parsed?.section !== 'night') return null
    return parsed
  } catch {
    return null
  }
}

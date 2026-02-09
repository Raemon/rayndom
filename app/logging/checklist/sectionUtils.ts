import type { SectionKey } from '../types'

export const getCurrentSection = (): SectionKey => {
  const now = new Date()
  const totalMinutes = now.getHours() * 60 + now.getMinutes()
  if (totalMinutes < 13 * 60) return 'morning'
  if (totalMinutes < 16 * 60) return 'afternoon'
  if (totalMinutes < 20 * 60) return 'evening'
  return 'night'
}

export const coerceSection = (section: string | null): SectionKey => {
  if (section === 'afternoon' || section === 'evening' || section === 'night') return section
  return 'morning'
}

export const SECTION_DEFINITIONS = [
  { key: 'weeHours' as const, label: 'Wee Hours', startMinutes: 0, endMinutes: 10 * 60 + 15 },
  { key: 'morning' as const, label: 'Morning', startMinutes: 10 * 60 + 30, endMinutes: 12 * 60 + 15 },
  { key: 'afternoon' as const, label: 'Afternoon', startMinutes: 12 * 60 + 30, endMinutes: 15 * 60 + 45 },
  { key: 'evening' as const, label: 'Evening', startMinutes: 16 * 60, endMinutes: 19 * 60 + 45 },
  { key: 'night' as const, label: 'Night', startMinutes: 20 * 60, endMinutes: 23 * 60 + 45 },
] as const

export const SECTION_ORDER: Record<SectionKey, number> = { morning: 0, afternoon: 1, evening: 2, night: 3 }

export const SECTION_DEFINITIONS_SIMPLE = [
  { key: 'morning' as const, label: 'Morning' },
  { key: 'afternoon' as const, label: 'Afternoon' },
  { key: 'evening' as const, label: 'Evening' },
  { key: 'night' as const, label: 'Night' },
] as const

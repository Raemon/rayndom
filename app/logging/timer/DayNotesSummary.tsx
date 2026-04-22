'use client'
import { Fragment, useMemo } from 'react'
import { sortBy, groupBy } from 'lodash'
import type { Timeblock } from '../types'

const formatHm = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, pre'

const extractLines = (html: string | null): string[] => {
  if (!html || typeof window === 'undefined') return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks = doc.body.querySelectorAll(BLOCK_SELECTOR)
  if (blocks.length === 0) {
    const text = doc.body.textContent?.trim()
    return text ? [text] : []
  }
  const lines: string[] = []
  for (const block of blocks) {
    if (block.parentElement?.closest(BLOCK_SELECTOR)) continue
    const text = block.textContent?.trim()
    if (text) lines.push(text)
  }
  return lines
}

const DayNotesSummary = ({ timeblocks }: { timeblocks: Timeblock[] }) => {
  const groups = useMemo(() => {
    const sortedTimeblocks = sortBy(timeblocks, tb => new Date(tb.datetime).getTime())
    const noteFields = ['rayNotes', 'assistantNotes', 'aiNotes'] as const
    const items: { time: string, sortKey: number, text: string, key: string }[] = []
    for (const tb of sortedTimeblocks) {
      const sortKey = new Date(tb.datetime).getTime()
      const time = formatHm(new Date(tb.datetime))
      for (const field of noteFields) {
        const lines = extractLines(tb[field])
        lines.forEach((text, i) => items.push({ time, sortKey, text, key: `${tb.id}:${field}:${i}` }))
      }
    }
    const grouped = groupBy(items, 'time')
    return sortBy(Object.entries(grouped), ([, list]) => list[0].sortKey).map(([time, list]) => ({ time, items: list }))
  }, [timeblocks])

  if (groups.length === 0) return null

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 mt-3 text-sm leading-5 text-gray-100">
      {groups.map(({ time, items }) => (
        <Fragment key={time}>
          <span className="text-[11px] text-gray-500 tabular-nums text-right self-start leading-5">{time}</span>
          <div className="flex flex-col gap-0.5 min-w-0">
            {items.map(({ key, text }) => (
              <span key={key} className="whitespace-pre-wrap break-words">{text}</span>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default DayNotesSummary

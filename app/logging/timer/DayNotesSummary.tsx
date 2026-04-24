'use client'
import { Fragment, useMemo } from 'react'
import { sortBy, groupBy } from 'lodash'
import type { Timeblock } from '../types'

const formatHm = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

const sanitizeHtml = (html: string | null): string | null => {
  if (!html || typeof window === 'undefined') return null
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const text = doc.body.textContent?.trim()
  return text ? doc.body.innerHTML : null
}

const NOTE_STYLES = `
  break-words
  [&_p]:my-0
  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-0
  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-0
  [&_li]:my-0
  [&_h1]:text-base [&_h1]:font-bold [&_h1]:my-1
  [&_h2]:text-sm [&_h2]:font-bold [&_h2]:my-1
  [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:my-1
  [&_h4]:font-semibold
  [&_strong]:font-bold
  [&_em]:italic
  [&_a]:text-blue-300 [&_a]:underline hover:[&_a]:text-blue-200
  [&_blockquote]:border-l-2 [&_blockquote]:border-gray-500 [&_blockquote]:pl-2 [&_blockquote]:text-gray-300 [&_blockquote]:my-1
  [&_code]:bg-white/10 [&_code]:text-gray-200 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
  [&_pre]:bg-white/5 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-1
  [&_pre_code]:bg-transparent [&_pre_code]:p-0
  [&_hr]:my-2 [&_hr]:border-gray-600
`

const DayNotesSummary = ({ timeblocks }: { timeblocks: Timeblock[] }) => {
  const groups = useMemo(() => {
    const sortedTimeblocks = sortBy(timeblocks, tb => new Date(tb.datetime).getTime())
    const noteFields = ['rayNotes', 'assistantNotes', 'aiNotes'] as const
    const items: { time: string, sortKey: number, html: string, key: string }[] = []
    for (const tb of sortedTimeblocks) {
      const sortKey = new Date(tb.datetime).getTime()
      const time = formatHm(new Date(tb.datetime))
      for (const field of noteFields) {
        const html = sanitizeHtml(tb[field])
        if (html) items.push({ time, sortKey, html, key: `${tb.id}:${field}` })
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
          <div className="flex flex-col gap-1 min-w-0">
            {items.map(({ key, html }) => (
              <div
                key={key}
                className={NOTE_STYLES}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default DayNotesSummary

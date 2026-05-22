import { useMemo, useState } from 'react'
import type { Timeblock } from '../types'
import DayNotesSummary from './DayNotesSummary'
import { formatHm } from '../lib/timeUtils'

// The collapsed day's notes preview: a compact, time-stamped excerpt that expands to the full
// DayNotesSummary on click. Kept as its own component so the expanded/excerpt state resets whenever
// the day is collapsed — it only mounts inside the collapsed summary, so re-collapsing starts fresh
// (no effect needed to reset it).
const CollapsedDayNotes = ({ timeblocks }: { timeblocks: Timeblock[] }) => {
  const [expanded, setExpanded] = useState(false)
  const excerpt = useMemo(() => {
    if (typeof window === 'undefined') return []
    const sorted = [...timeblocks].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    const parser = new DOMParser()
    const lines: { time: string, text: string }[] = []
    for (const tb of sorted) {
      const time = formatHm(new Date(tb.datetime))
      for (const field of ['rayNotes', 'assistantNotes', 'aiNotes'] as const) {
        const html = tb[field]
        if (!html) continue
        const doc = parser.parseFromString(html, 'text/html')
        const text = doc.body.textContent?.trim()
        if (text) lines.push({ time, text })
      }
    }
    return lines
  }, [timeblocks])

  if (expanded) {
    return (
      <div className="cursor-pointer" onClick={(e) => {
        if ((e.target as HTMLElement).closest('a')) return
        e.stopPropagation()
        setExpanded(false)
      }}>
        <DayNotesSummary timeblocks={timeblocks} />
      </div>
    )
  }
  if (excerpt.length === 0) return null
  return (
    <div className="mt-3 text-sm text-gray-400 cursor-pointer space-y-0.5" onClick={(e) => { e.stopPropagation(); setExpanded(true) }}>
      {excerpt.slice(0, 8).map((item, i) => (
        <div key={i} className="truncate"><span className="text-gray-500">{item.time}</span> {item.text}</div>
      ))}
      {excerpt.length > 8 && <div className="text-gray-500 text-xs">+ {excerpt.length - 8} more...</div>}
    </div>
  )
}

export default CollapsedDayNotes

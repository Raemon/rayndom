'use client'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

type DailyLog = {
  hourlyLog: Record<string, string>
  summary?: string
  surprisesAndUpdates?: string
  medical?: string
  commitments?: string
}

type DayEntry = { date: string; log: DailyLog | null; loading: boolean; error?: string }

const CollapsibleSection = ({title, content, defaultOpen = false}: {title: string, content: string, defaultOpen?: boolean}) => {
  const [open, setOpen] = useState(defaultOpen)
  if (!content || content === 'No medical information recorded.' || content === 'No commitments recorded.') return null
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-sm text-gray-300 hover:text-white cursor-pointer py-0.5">
        <span className="text-xs w-4">{open ? '▼' : '▶'}</span>
        <span className="font-medium">{title}</span>
      </button>
      {open && (
        <div className="pl-5 text-sm text-gray-400 prose prose-invert prose-sm max-w-none [&_ul]:my-0 [&_li]:my-0 [&_p]:my-0.5">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

const HourlyLog = ({hourlyLog}: {hourlyLog: Record<string, string>}) => {
  const [open, setOpen] = useState(false)
  const sortedHours = Object.keys(hourlyLog).sort()
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-sm text-gray-300 hover:text-white cursor-pointer py-0.5">
        <span className="text-xs w-4">{open ? '▼' : '▶'}</span>
        <span className="font-medium">Hourly Log ({sortedHours.length} hours)</span>
      </button>
      {open && (
        <div className="pl-5 text-sm">
          {sortedHours.map(hour => (
            <div key={hour} className="flex gap-2 py-0.5">
              <span className="text-gray-500 shrink-0 font-mono">{hour}</span>
              <span className="text-gray-400">{hourlyLog[hour]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const DayLog = ({entry}: {entry: DayEntry}) => {
  if (entry.loading) return <div className="text-gray-500 text-sm py-1">Loading {entry.date}...</div>
  if (entry.error) return <div className="text-red-400 text-sm py-1">{entry.date}: {entry.error}</div>
  if (!entry.log) return null
  const { hourlyLog, summary, surprisesAndUpdates, medical, commitments } = entry.log
  return (
    <div className="mb-4">
      <div className="text-white font-medium mb-1">{entry.date}</div>
      <div className="pl-2 flex flex-col gap-0.5">
        <CollapsibleSection title="Summary" content={summary || ''} defaultOpen />
        <HourlyLog hourlyLog={hourlyLog} />
        <CollapsibleSection title="Surprises & Updates" content={surprisesAndUpdates || ''} defaultOpen />
        <CollapsibleSection title="Medical" content={medical || ''} defaultOpen />
        <CollapsibleSection title="Commitments" content={commitments || ''} defaultOpen />
      </div>
    </div>
  )
}

const DailyLogPage = () => {
  const [days, setDays] = useState<DayEntry[]>([])
  const [loadingDates, setLoadingDates] = useState(true)
  useEffect(() => {
    fetch('/api/daily-log')
      .then(res => res.json())
      .then(async ({ dates }: { dates: string[] }) => {
        setLoadingDates(false)
        const entries: DayEntry[] = dates.map(date => ({ date, log: null, loading: true }))
        setDays(entries)
        const logFetches = dates.map(async (date, i) => {
          try {
            const res = await fetch(`/api/daily-log?date=${date}`)
            const log: DailyLog = await res.json()
            setDays(prev => prev.map((d, j) => j === i ? { ...d, log, loading: false } : d))
          } catch (err) {
            setDays(prev => prev.map((d, j) => j === i ? { ...d, loading: false, error: String(err) } : d))
          }
        })
        await Promise.all(logFetches)
      })
      .catch(() => setLoadingDates(false))
  }, [])
  return (
    <div className="p-4 text-sm max-w-[600px] mx-auto">
      <div className="text-lg text-white mb-2">Daily Log</div>
      {loadingDates && <div className="text-gray-500">Loading...</div>}
      {days.map(entry => <DayLog key={entry.date} entry={entry} />)}
    </div>
  )
}

export default DailyLogPage

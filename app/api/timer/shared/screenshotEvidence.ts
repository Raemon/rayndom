export type ScreenshotWindowEvidence = { title?: string, applicationName?: string, url?: string, exactText?: string }
export type ScreenshotEvidenceEntry = { timestamp: string, sourcePath?: string, windows: ScreenshotWindowEvidence[], summary: string }

export const parseScreenshotEvidenceEntries = (text: string): ScreenshotEvidenceEntry[] => {
  const entries: ScreenshotEvidenceEntry[] = []
  const entryRegex = /([^\n]*?(\d{4}-\d{2}-\d{2})\s+(\d{2})_(\d{2})_(\d{2})[^\n]*\.json):\s*\n?(\{[\s\S]*?\n\}(?=\n\n|\n\/|$))/g
  let match
  while ((match = entryRegex.exec(text)) !== null) {
    const [sourcePath, , date, hour, minute, second, jsonStr] = match
    const timestamp = `${date}T${hour}:${minute}:${second}`
    try {
      const obj = JSON.parse(jsonStr)
      const windows = obj?.windows && Array.isArray(obj.windows) ? obj.windows : []
      const windowEvidence: ScreenshotWindowEvidence[] = []
      const windowsToSummarize: ScreenshotWindowEvidence[] = []
      for (const win of windows.slice(0, 3)) {
        const w: ScreenshotWindowEvidence = {}
        if (typeof win?.title === 'string') w.title = win.title
        if (typeof win?.applicationName === 'string') w.applicationName = win.applicationName
        if (typeof win?.url === 'string') w.url = win.url
        if (typeof win?.exactText === 'string') w.exactText = win.exactText.slice(0, 800)
        windowEvidence.push(w)
        windowsToSummarize.push(w)
      }
      const summaryParts: string[] = []
      for (const win of windowsToSummarize.slice(0, 2)) {
        if (win.applicationName) summaryParts.push(win.applicationName)
        if (win.title && win.title !== win.applicationName) summaryParts.push(win.title.slice(0, 80))
        if (win.url) summaryParts.push(win.url.slice(0, 140))
      }
      const summary = summaryParts.join(' - ')
      entries.push({ timestamp, sourcePath, windows: windowEvidence, summary })
    } catch (e) {
      // Skip invalid JSON
    }
  }
  return entries
}

export const getDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000)

export const fetchScreenshotEvidenceForDate = async (dateStr: string): Promise<{ dateStr: string, entries: ScreenshotEvidenceEntry[], rawText: string } | { dateStr: string, error: string }> => {
  try {
    const res = await fetch(`http://localhost:8765/${dateStr}/screenshots/summaries`)
    if (!res.ok) return { dateStr, error: `HTTP ${res.status}` }
    const rawText = await res.text()
    if (!rawText.trim()) return { dateStr, entries: [], rawText: '' }
    const entries = parseScreenshotEvidenceEntries(rawText)
    return { dateStr, entries, rawText }
  } catch (e) {
    return { dateStr, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export const getEntriesInRange = (entries: ScreenshotEvidenceEntry[], start: Date, end: Date) => {
  const inRange: ScreenshotEvidenceEntry[] = []
  for (const entry of entries) {
    const t = new Date(entry.timestamp)
    if (t >= start && t < end) inRange.push(entry)
  }
  return inRange
}


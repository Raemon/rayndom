type KeylogEntry = { timestamp: string, text: string, app?: string }
export type ScreenshotSummary = { timestamp: string, summary: string }

export const parseScreenshotSummaries = (text: string): ScreenshotSummary[] => {
  const entries: ScreenshotSummary[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.trim()) continue
    const match = line.match(/^\[(\d{4}-\d{2}-\d{2}[T ]\d{2}[:.]\d{2}[:.]\d{2})\]\s*(.*)$/)
    if (match) {
      const [, timestamp, summary] = match
      entries.push({ timestamp: timestamp.replace(/ /, 'T').replace(/\./g, ':'), summary })
    }
  }
  return entries
}

export const parseKeylogText = (text: string): KeylogEntry[] => {
  const entries: KeylogEntry[] = []
  const blocks = text.split(/\n\n+/)
  for (const block of blocks) {
    if (!block.trim()) continue
    const lines = block.split('\n')
    const headerMatch = lines[0]?.match(/^(\d{4}-\d{2}-\d{2} \d{2}\.\d{2}\.\d{2}):\s*(.*)$/)
    if (headerMatch) {
      const [, timestampStr, app] = headerMatch
      const isoTimestamp = timestampStr.replace(/ /, 'T').replace(/\./g, ':')
      const textContent = lines.slice(1).join('\n').trim()
      entries.push({ timestamp: isoTimestamp, text: textContent, app: app || undefined })
    }
  }
  return entries
}

export const getKeylogsForTimeblock = async (datetime: string): Promise<{ keylogs: KeylogEntry[], keylogText: string } | { error: string }> => {
  const blockDatetime = new Date(datetime)
  const getEntryTime = (timestamp: string) => {
    const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
    if (match) {
      const [, year, month, day, hour, minute, second] = match
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
    }
    return new Date(timestamp)
  }
  const now = new Date()
  const effectiveEndDatetime = now
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
  let keylogs: KeylogEntry[] = []
  try {
    const keylogRes = await fetch('http://localhost:8765/today')
    if (!keylogRes.ok) {
      return { error: `Keylog server returned ${keylogRes.status}` }
    }
    const responseText = await keylogRes.text()
    if (!responseText.trim()) {
      return { keylogs: [], keylogText: '' }
    }
    const allKeylogs = parseKeylogText(responseText)
    keylogs = allKeylogs.filter((entry: KeylogEntry) => {
      const entryTime = getEntryTime(entry.timestamp)
      return entryTime >= fifteenMinutesAgo && entryTime <= effectiveEndDatetime
    })
  } catch (e) {
    return { error: 'Keylog server not reachable at localhost:8765' }
  }
  if (keylogs.length === 0) {
    return { keylogs: [], keylogText: '' }
  }
  const keylogText = keylogs.map(k => `[${k.timestamp}]${k.app ? ` (${k.app})` : ''} ${k.text}`).join('\n')
  return { keylogs, keylogText }
}

export const getScreenshotSummariesForTimeblock = async (datetime: string): Promise<string> => {
  const now = new Date()
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
  try {
    const screenshotsRes = await fetch('http://localhost:8765/today/screenshots/summaries')
    if (screenshotsRes.ok) {
      const responseText = await screenshotsRes.text()
      if (responseText.trim()) {
        const allSummaries = parseScreenshotSummaries(responseText)
        const recentSummaries = allSummaries.filter((entry) => {
          const entryTime = new Date(entry.timestamp)
          return entryTime >= fifteenMinutesAgo && entryTime <= now
        })
        if (recentSummaries.length > 0) {
          return recentSummaries.map(s => `[${s.timestamp}] ${s.summary}`).join('\n')
        }
      }
    }
  } catch {
    // Screenshot summaries are optional, continue without them
  }
  return ''
}

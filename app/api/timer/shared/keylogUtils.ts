type KeylogEntry = { timestamp: string, text: string, app?: string }
export type ScreenshotSummary = { timestamp: string, summary: string }

export const parseScreenshotSummaries = (text: string): ScreenshotSummary[] => {
  const entries: ScreenshotSummary[] = []
  // Match file path with timestamp, followed by JSON object
  // Format: /path/2026-02-03 01_53_25.AppName.title.json:\n{...}
  const entryRegex = /([^\n]*?(\d{4}-\d{2}-\d{2})\s+(\d{2})_(\d{2})_(\d{2})[^\n]*\.json):\s*\n?(\{[\s\S]*?\n\}(?=\n\n|\n\/|$))/g
  let match
  while ((match = entryRegex.exec(text)) !== null) {
    const [, , date, hour, minute, second, jsonStr] = match
    const timestamp = `${date}T${hour}:${minute}:${second}`
    try {
      const obj = JSON.parse(jsonStr)
      if (obj.windows && Array.isArray(obj.windows)) {
        const summaryParts: string[] = []
        for (const win of obj.windows.slice(0, 2)) {
          if (win.applicationName) summaryParts.push(win.applicationName)
          if (win.title && win.title !== win.applicationName) summaryParts.push(win.title.slice(0, 50))
        }
        if (summaryParts.length > 0) {
          entries.push({ timestamp, summary: summaryParts.join(' - ') })
        }
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }
  return entries.slice(-6)
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
  const sortedEntries = entries.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime()
    const timeB = new Date(b.timestamp).getTime()
    return timeB - timeA
  })
  return sortedEntries.slice(0, 6)
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
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  let keylogs: KeylogEntry[] = []
  try {
    console.log('[keylogUtils] Fetching keylogs from localhost:8765/today...')
    const keylogRes = await fetch('http://localhost:8765/today')
    console.log('[keylogUtils] Keylog response status:', keylogRes.status)
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
      return entryTime >= oneHourAgo && entryTime <= effectiveEndDatetime
    })
  } catch (e) {
    console.error('[keylogUtils] Failed to fetch keylogs:', e)
    return { error: 'Keylog server not reachable at localhost:8765' }
  }
  if (keylogs.length === 0) {
    return { keylogs: [], keylogText: '' }
  }
  const keylogText = keylogs.map(k => `[${k.timestamp}]${k.app ? ` (${k.app})` : ''} ${k.text}`).join('\n')
  return { keylogs, keylogText }
}

export const getScreenshotSummariesForTimeblock = async (): Promise<string> => {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  try {
    console.log('[keylogUtils] Fetching screenshot summaries from localhost:8765...')
    const screenshotsRes = await fetch('http://localhost:8765/today/screenshots/summaries')
    console.log('[keylogUtils] Screenshot summaries response status:', screenshotsRes.status)
    if (screenshotsRes.ok) {
      const responseText = await screenshotsRes.text()
      if (responseText.trim()) {
        const allSummaries = parseScreenshotSummaries(responseText)
        const recentSummaries = allSummaries.filter((entry) => {
          const entryTime = new Date(entry.timestamp)
          return entryTime >= oneHourAgo && entryTime <= now
        })
        if (recentSummaries.length > 0) {
          return recentSummaries.map(s => `[${s.timestamp}] ${s.summary}`).join('\n')
        }
      }
    }
  } catch (e) {
    console.error('[keylogUtils] Failed to fetch screenshot summaries:', e)
    // Screenshot summaries are optional, continue without them
  }
  return ''
}

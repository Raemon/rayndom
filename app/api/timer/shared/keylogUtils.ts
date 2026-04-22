type KeylogEntry = { timestamp: string, text: string, app?: string }
export type ScreenshotSummary = { timestamp: string, summary: string }

type TodayKeylogItem = {
  type: 'keylog'
  start: string
  end: string
  appName?: string
  windowTitle?: string
  keylogs: string
}

type TodayScreenshotItem = {
  type: 'screenshotSummary'
  timestamp: string
  appName?: string
  windowTitle?: string
}

type TodayItem = TodayKeylogItem | TodayScreenshotItem

const parseTodayTimestamp = (s: string): Date | null => {
  // Format: "2026-04-21_02.08.30PM"
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})\.(\d{2})\.(\d{2})(AM|PM)$/)
  if (!match) return null
  const [, y, mo, d, h, mi, se, ampm] = match
  const hour12 = Number(h) % 12
  const hour = ampm === 'PM' ? hour12 + 12 : hour12
  return new Date(Number(y), Number(mo) - 1, Number(d), hour, Number(mi), Number(se))
}

const formatIsoLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const itemTimestamp = (item: TodayItem): Date | null => parseTodayTimestamp(item.type === 'keylog' ? item.start : item.timestamp)

export const getTodayData = async ({ withinMs, maxKeylogs = 6, maxSummaries = 6 }:{ withinMs?: number, maxKeylogs?: number, maxSummaries?: number } = {}): Promise<{ keylogs: KeylogEntry[], keylogText: string, screenshotSummariesText: string } | { error: string }> => {
  let items: TodayItem[]
  try {
    console.log('[keylogUtils] Fetching /today from localhost:8765...')
    const res = await fetch('http://localhost:8765/today')
    console.log('[keylogUtils] /today response status:', res.status)
    if (!res.ok) return { error: `Today server returned ${res.status}` }
    items = await res.json()
  } catch (e) {
    console.error('[keylogUtils] Failed to fetch /today:', e)
    return { error: 'Today server not reachable at localhost:8765' }
  }
  const now = new Date()
  const cutoff = withinMs !== undefined ? new Date(now.getTime() - withinMs) : null
  const itemsInWindow = items.filter(item => {
    const ts = itemTimestamp(item)
    if (!ts) return false
    if (cutoff && ts < cutoff) return false
    if (ts > now) return false
    return true
  })
  const sortedDesc = (xs: TodayItem[]) => xs.slice().sort((a, b) => itemTimestamp(b)!.getTime() - itemTimestamp(a)!.getTime())
  const keylogItems = sortedDesc(itemsInWindow.filter((i): i is TodayKeylogItem => i.type === 'keylog')).slice(0, maxKeylogs) as TodayKeylogItem[]
  const summaryItems = sortedDesc(itemsInWindow.filter((i): i is TodayScreenshotItem => i.type === 'screenshotSummary')).slice(0, maxSummaries) as TodayScreenshotItem[]
  const keylogs: KeylogEntry[] = keylogItems.map(item => ({
    timestamp: formatIsoLocal(itemTimestamp(item)!),
    text: item.keylogs.trim(),
    app: item.appName,
  }))
  const keylogText = keylogs.map(k => `[${k.timestamp}]${k.app ? ` (${k.app})` : ''} ${k.text}`).join('\n')
  const summaries: ScreenshotSummary[] = summaryItems.map(item => {
    const parts: string[] = []
    if (item.appName) parts.push(item.appName)
    if (item.windowTitle && item.windowTitle !== item.appName) parts.push(item.windowTitle.slice(0, 80))
    return { timestamp: formatIsoLocal(itemTimestamp(item)!), summary: parts.join(' - ') }
  }).filter(s => s.summary)
  const screenshotSummariesText = summaries.map(s => `[${s.timestamp}] ${s.summary}`).join('\n')
  return { keylogs, keylogText, screenshotSummariesText }
}

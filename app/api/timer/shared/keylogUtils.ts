type KeylogEntry = { timestamp: string, text: string, app?: string }

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
  const fifteenMinutesAgo = new Date(blockDatetime.getTime() - 15 * 60 * 1000)
  let keylogs: KeylogEntry[] = []
  try {
    const keylogRes = await fetch('http://localhost:8765/today')
    if (!keylogRes.ok) {
      return { error: `Keylog server returned ${keylogRes.status}` }
    }
    const responseText = await keylogRes.text()
    if (!responseText.trim()) {
      return { error: 'Keylog server returned empty response' }
    }
    const allKeylogs = parseKeylogText(responseText)
    keylogs = allKeylogs.filter((entry: KeylogEntry) => {
      const entryTime = new Date(entry.timestamp)
      return entryTime >= fifteenMinutesAgo && entryTime <= blockDatetime
    })
  } catch (e) {
    return { error: 'Keylog server not reachable at localhost:8765' }
  }
  if (keylogs.length === 0) {
    return { error: 'No keylogs found for the past 15 minutes' }
  }
  const keylogText = keylogs.map(k => `[${k.timestamp}]${k.app ? ` (${k.app})` : ''} ${k.text}`).join('\n')
  return { keylogs, keylogText }
}

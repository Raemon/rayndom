let cachedUsageTimestamps: Record<number, number> = {}
let cacheTimestamp = 0
const CACHE_DURATION = 30000

export const getTagUsageTimestamps = async (): Promise<Record<number, number>> => {
  const now = Date.now()
  if (now - cacheTimestamp < CACHE_DURATION && Object.keys(cachedUsageTimestamps).length > 0) {
    return cachedUsageTimestamps
  }
  try {
    const res = await fetch('/api/timer/tag-usage')
    const json = await res.json()
    cachedUsageTimestamps = json.usageTimestamps || {}
    cacheTimestamp = now
    return cachedUsageTimestamps
  } catch (e) {
    console.error('Failed to get tag usage:', e)
    return cachedUsageTimestamps
  }
}

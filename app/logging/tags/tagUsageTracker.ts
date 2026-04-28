let cachedUsageTimestamps: Record<number, number> = {}
let cacheTimestamp = 0
let refreshInFlight = false
const CACHE_DURATION = 30000

const refreshCache = () => {
  if (refreshInFlight) return
  refreshInFlight = true
  fetch('/api/timer/tag-usage')
    .then(res => res.json())
    .then(json => {
      cachedUsageTimestamps = json.usageTimestamps || {}
      cacheTimestamp = Date.now()
    })
    .catch(e => console.error('Failed to get tag usage:', e))
    .finally(() => { refreshInFlight = false })
}

export const getTagUsageTimestamps = (): Record<number, number> => {
  const now = Date.now()
  if (now - cacheTimestamp >= CACHE_DURATION || Object.keys(cachedUsageTimestamps).length === 0) {
    refreshCache()
  }
  return cachedUsageTimestamps
}

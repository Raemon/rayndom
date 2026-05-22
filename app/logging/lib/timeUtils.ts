// Local calendar-day key (YYYY-MM-DD). Uses local date components so days bucket by the
// user's wall-clock date regardless of UTC offset (toISOString would shift positive-offset
// timezones to the previous day).
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

// Local hour:minute label, e.g. "9:05 AM".
export const formatHm = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

export const getNextQuarterHourMs = (now: Date) => {
  const nextQuarterMinutes = Math.floor(now.getMinutes() / 15) * 15 + 15
  const next = new Date(now)
  if (nextQuarterMinutes >= 60) {
    next.setHours(now.getHours() + 1, 0, 0, 0)
  } else {
    next.setMinutes(nextQuarterMinutes, 0, 0)
  }
  return next.getTime()
}

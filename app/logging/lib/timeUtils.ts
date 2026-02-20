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

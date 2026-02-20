'use client'
import { useEffect, useState } from 'react'
import { getNextQuarterHourMs } from './lib/timeUtils'

const formatRemaining = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

const HeaderTimer = () => {
  const [remainingMs, setRemainingMs] = useState(0)

  useEffect(() => {
    const tick = () => {
      const nowMs = Date.now()
      const nextMarkMs = getNextQuarterHourMs(new Date(nowMs))
      const remaining = Math.max(0, nextMarkMs - nowMs)
      setRemainingMs(remaining)
      document.title = formatRemaining(remaining)
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-xl font-bold text-white">
      {formatRemaining(remainingMs)}
    </div>
  )
}

export default HeaderTimer

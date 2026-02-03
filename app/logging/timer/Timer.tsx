'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type TimerProps = {
  onTimerComplete?: () => void
  onPredictTags?: () => void
  onRunAiCommand?: (datetime: string) => Promise<void>
  checklistRef: { current: { resetAllItems: () => void, refreshItems: () => void } | null }
  isPredicting: boolean
}

const getNextQuarterHourMs = (now: Date) => {
  const nextQuarterMinutes = Math.floor(now.getMinutes() / 15) * 15 + 15
  const next = new Date(now)
  if (nextQuarterMinutes >= 60) {
    next.setHours(now.getHours() + 1, 0, 0, 0)
  } else {
    next.setMinutes(nextQuarterMinutes, 0, 0)
  }
  return next.getTime()
}

const formatRemaining = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

const playBing = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gainNode.gain.setValueAtTime(0.0001, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.25, context.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3)
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.35)
    oscillator.onended = () => context.close()
  } catch (e) {
    console.warn('[Timer] Failed to play bing:', e)
  }
}

const Timer = (props: TimerProps) => {
  const { onTimerComplete, isPredicting, onRunAiCommand } = props
  const [remainingMs, setRemainingMs] = useState(0)
  const nextMarkMsRef = useRef<number | null>(null)
  const predictMarkMsRef = useRef<number | null>(null)
  const lastPredictMarkRef = useRef<number | null>(null)
  const lastBingMarkRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)

  const runAiCommand = useCallback(async (datetime: string) => {
    if (isPredicting) return
    if (!onRunAiCommand) return
    if (isRunningRef.current) return
    isRunningRef.current = true
    try {
      await onRunAiCommand(datetime)
    } catch (e) {
      console.error('[Timer] Failed to run AI command:', e)
    } finally {
      isRunningRef.current = false
    }
  }, [isPredicting, onRunAiCommand])

  useEffect(() => {
    const tick = () => {
      const nowMs = Date.now()
      if (!nextMarkMsRef.current || nowMs >= nextMarkMsRef.current) {
        const nextMarkMs = getNextQuarterHourMs(new Date(nowMs))
        nextMarkMsRef.current = nextMarkMs
        predictMarkMsRef.current = nextMarkMs - 90 * 1000
      }
      const nextMarkMs = nextMarkMsRef.current as number
      const predictMarkMs = predictMarkMsRef.current as number
      if (nowMs >= predictMarkMs && lastPredictMarkRef.current !== nextMarkMs) {
        lastPredictMarkRef.current = nextMarkMs
        runAiCommand(new Date(nextMarkMs).toISOString())
      }
      if (nowMs >= nextMarkMs && lastBingMarkRef.current !== nextMarkMs) {
        lastBingMarkRef.current = nextMarkMs
        playBing()
        onTimerComplete?.()
        const nextNextMarkMs = getNextQuarterHourMs(new Date(nowMs + 1000))
        nextMarkMsRef.current = nextNextMarkMs
        predictMarkMsRef.current = nextNextMarkMs - 90 * 1000
      }
      setRemainingMs(Math.max(0, (nextMarkMsRef.current as number) - nowMs))
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [onTimerComplete, runAiCommand])

  return (
    <div className="text-xs text-gray-600">
      Next mark in {formatRemaining(remainingMs)}
    </div>
  )
}

export default Timer

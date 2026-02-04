'use client'
import { useCallback, useEffect, useRef } from 'react'

type TimerProps = {
  onTimerComplete?: () => void
  onPredictTags?: () => void
  onRunAiCommand?: (datetime: string) => Promise<void>
  checklistRef?: { current: { resetAllItems: () => void, refreshItems: () => void } | null }
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
      // Initialize refs if not set
      if (!nextMarkMsRef.current) {
        nextMarkMsRef.current = getNextQuarterHourMs(new Date(nowMs))
        predictMarkMsRef.current = nextMarkMsRef.current - 90 * 1000
      }
      const nextMarkMs = nextMarkMsRef.current as number
      const predictMarkMs = predictMarkMsRef.current as number
      // Check predict trigger (90s before quarter hour)
      if (nowMs >= predictMarkMs && lastPredictMarkRef.current !== nextMarkMs) {
        lastPredictMarkRef.current = nextMarkMs
        runAiCommand(new Date(nextMarkMs).toISOString())
      }
      // Check bing trigger (at quarter hour)
      if (nowMs >= nextMarkMs && lastBingMarkRef.current !== nextMarkMs) {
        lastBingMarkRef.current = nextMarkMs
        playBing()
        onTimerComplete?.()
      }
      // Advance to next quarter hour if we've passed the current one
      if (nowMs >= nextMarkMs) {
        const nextNextMarkMs = getNextQuarterHourMs(new Date(nowMs + 1000))
        nextMarkMsRef.current = nextNextMarkMs
        predictMarkMsRef.current = nextNextMarkMs - 90 * 1000
      }
    }
    tick()
    const interval = setInterval(tick, 500)
    // When tab becomes visible again, immediately tick to catch up on any missed timers
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [onTimerComplete, runAiCommand])

  return null
}

export default Timer

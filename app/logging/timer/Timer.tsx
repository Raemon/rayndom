'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getNextQuarterHourMs } from '../lib/timeUtils'

type TimerProps = {
  onTimerComplete?: () => void
  onPredictTags?: () => void
  onRunAiCommand?: (datetime: string) => Promise<void>
  checklistRef?: { current: { resetAllItems: () => void, refreshItems: () => void } | null }
  isPredicting: boolean
}

const playSingleBing = (context: AudioContext, startTime: number) => {
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = 880
  gainNode.gain.setValueAtTime(0.0001, startTime)
  gainNode.gain.exponentialRampToValueAtTime(0.7, startTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3)
  oscillator.connect(gainNode)
  gainNode.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + 0.35)
  return oscillator
}

const playBing = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const context = new AudioContextClass()
    const bingInterval = 0.5
    let lastOscillator: OscillatorNode | null = null
    for (let i = 0; i < 3; i++) {
      lastOscillator = playSingleBing(context, context.currentTime + i * bingInterval)
    }
    if (lastOscillator) lastOscillator.onended = () => context.close()
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
  const [audioAllowed, setAudioAllowed] = useState(true)

  useEffect(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      const testCtx = new AudioContextClass()
      const needsInteraction = testCtx.state !== 'running'
      testCtx.close().catch(() => {})
      if (!needsInteraction) return
      setAudioAllowed(false)
      const handleInteraction = () => {
        setAudioAllowed(true)
        for (const event of ['click', 'keydown', 'touchstart'] as const) {
          document.removeEventListener(event, handleInteraction)
        }
      }
      for (const event of ['click', 'keydown', 'touchstart'] as const) {
        document.addEventListener(event, handleInteraction)
      }
      return () => {
        for (const event of ['click', 'keydown', 'touchstart'] as const) {
          document.removeEventListener(event, handleInteraction)
        }
      }
    } catch {
      // AudioContext not available
    }
  }, [])

  const requestFocus = useCallback(() => {
    try {
      if (typeof window === 'undefined') return
      if (window.rayndom?.focusMainWindow) { window.rayndom.focusMainWindow().catch(e => console.warn('[Timer] Failed to request focus:', e)); return }
      window.focus()
    } catch (e) {
      console.warn('[Timer] Failed to request focus:', e)
    }
  }, [])

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
        requestFocus()
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
  }, [onTimerComplete, requestFocus, runAiCommand])

  if (!audioAllowed) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 mb-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded cursor-pointer select-none"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5.586v12.828a1 1 0 01-1.707.707L5.586 15z" />
        </svg>
        Click anywhere on the page to enable timer sounds
      </div>
    )
  }

  return null
}

export default Timer

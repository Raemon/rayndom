'use client'
import { useEffect, useState, useRef } from 'react'
import type { ChecklistRef } from '../checklist/Checklist'

type AlarmSound = {
  name: string
  play: (audioContext: AudioContext) => void
}

const playBell = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  oscillator.frequency.value = 800
  oscillator.type = 'sine'
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}

const playChime = (audioContext: AudioContext) => {
  const frequencies = [523.25, 659.25, 783.99]
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = freq
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.6)
    oscillator.start(audioContext.currentTime + index * 0.1)
    oscillator.stop(audioContext.currentTime + index * 0.1 + 0.6)
  })
}

const playBeep = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  oscillator.frequency.value = 1000
  oscillator.type = 'square'
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

const ALARM_SOUNDS: AlarmSound[] = [
  { name: 'Bell', play: playBell },
  { name: 'Chime', play: playChime },
  { name: 'Beep', play: playBeep },
]

type TimerProps = {
  onTimerComplete: () => void
  onPredictTags: () => void
  checklistRef: React.RefObject<ChecklistRef | null>
  isPredicting: boolean
}

const Timer = ({ onTimerComplete, onPredictTags, checklistRef, isPredicting }: TimerProps) => {
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(0)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isAlarming, setIsAlarming] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const selectedSoundIndexRef = useRef(0)
  const prevSecondsRef = useRef<number | null>(null)
  const lastPredictedBlockRef = useRef<string | null>(null)
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getNext15MinuteMark = () => {
    const now = new Date()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const milliseconds = now.getMilliseconds()
    const totalSecondsIntoHour = minutes * 60 + seconds + milliseconds / 1000 + 0.001
    const nextMarkMinutes = Math.ceil(totalSecondsIntoHour / 900) * 15
    const nextMark = new Date(now)
    if (nextMarkMinutes >= 60) {
      nextMark.setHours(nextMark.getHours() + 1)
      nextMark.setMinutes(0)
    } else {
      nextMark.setMinutes(nextMarkMinutes)
    }
    nextMark.setSeconds(0)
    nextMark.setMilliseconds(0)
    const diffMs = nextMark.getTime() - now.getTime()
    return Math.max(0, Math.floor(diffMs / 1000))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    if ('Notification' in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotificationPermission(Notification.permission)
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('15-Minute Timer', {
        body: 'Time is up!',
        requireInteraction: true,
      })
      notification.onclick = () => {
        window.focus()
        notification.close()
        stopAlarming()
      }
    }
  }

  const startAlarming = () => {
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current)
    }
    setIsAlarming(true)
    let flashState = true
    flashIntervalRef.current = setInterval(() => {
      document.title = flashState ? '⏰ TIME UP!' : '⏰ -------'
      flashState = !flashState
    }, 500)
  }

  const stopAlarming = () => {
    setIsAlarming(false)
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current)
      flashIntervalRef.current = null
    }
    document.title = formatTime(getNext15MinuteMark())
  }

  const playAlarm = () => {
    if (audioContextRef.current) {
      const context = audioContextRef.current
      if (context.state === 'suspended') {
        context.resume()
      }
      ALARM_SOUNDS[selectedSoundIndexRef.current].play(context)
    }
  }

  useEffect(() => {
    selectedSoundIndexRef.current = selectedSoundIndex
  }, [selectedSoundIndex])

  useEffect(() => {
    const initial = getNext15MinuteMark()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecondsRemaining(initial)
    prevSecondsRef.current = initial
    const interval = setInterval(() => {
      const remaining = getNext15MinuteMark()
      const prev = prevSecondsRef.current
      // Detect when we've crossed the 15-minute mark:
      // - remaining === 0: we just hit the mark
      // - prev <= 5 && remaining > 60: we jumped over (e.g. tab was backgrounded)
      // Require prev > 0 to prevent re-triggering after hitting 0
      const shouldAlarm = prev !== null && prev > 0 && (remaining === 0 || (prev <= 5 && remaining > 60))
      // Trigger tag prediction 90 seconds before the timer completes
      // Calculate which block we're about to enter (the next 15-minute mark)
      const now = new Date()
      const nextBlockTime = new Date(now.getTime() + remaining * 1000)
      // CRITICAL: Round to seconds to prevent millisecond drift creating different keys each tick
      nextBlockTime.setMilliseconds(0)
      const nextBlockKey = nextBlockTime.toISOString()
      // Also handle jumps over the 90-second threshold (e.g., from tab backgrounding)
      const jumpedInto90SecondWindow = prev !== null && prev > 90 && remaining <= 90 && remaining > 0
      const isIn90SecondWindow = remaining <= 90 && remaining > 0
      const notYetPredictedForThisBlock = lastPredictedBlockRef.current !== nextBlockKey
      const shouldPredict = (isIn90SecondWindow || jumpedInto90SecondWindow) && notYetPredictedForThisBlock
      if (shouldPredict) {
        console.log('[Timer] Triggering prediction for block:', nextBlockKey, 'remaining:', remaining, 'prev:', prev)
        lastPredictedBlockRef.current = nextBlockKey
        onPredictTags()
      }
      if (shouldAlarm) {
        playAlarm()
        showNotification()
        startAlarming()
        // Reset all items to unchecked
        checklistRef.current?.resetAllItems()
        // Play alarm multiple times to be more noticeable
        setTimeout(playAlarm, 500)
        setTimeout(playAlarm, 1000)
        setTimeout(playAlarm, 2000)
        setTimeout(playAlarm, 3000)
        onTimerComplete()
      }
      prevSecondsRef.current = remaining
      setSecondsRemaining(remaining)
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPredictTags, onTimerComplete])

  useEffect(() => {
    if (!isAlarming) {
      document.title = formatTime(secondsRemaining)
    }
  }, [secondsRemaining, isAlarming])

  useEffect(() => {
    playAlarm()
  }, [selectedSoundIndex])

  return (
    <div className="mb-4 flex items-center gap-8" onClick={isAlarming ? stopAlarming : undefined}>
      <div className="text-2xl font-bold mb-2">
        {formatTime(secondsRemaining)}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <select
          value={selectedSoundIndex}
          onChange={(e) => setSelectedSoundIndex(Number(e.target.value))}
          className="px-2 py-1 bg-transparent! outline-none text-gray-400!"
        >
          {ALARM_SOUNDS.map((sound, index) => (
            <option key={index} value={index} className="bg-transparent!">
              {sound.name}
            </option>
          ))}
        </select>
        {notificationPermission === 'default' && (
          <button onClick={requestNotificationPermission} className="px-2 py-1 bg-blue-100">
            Enable Notifications
          </button>
        )}
        {notificationPermission === 'denied' && <span className="text-red-600">Notifications blocked</span>}
      </div>
    </div>
  )
}

export default Timer

'use client'
import { useEffect, useState, useRef } from 'react'
import DaySection from './DaySection'
import TagSidebar from './TagSidebar'
import { useTimeblocks } from './hooks/useTimeblocks'
import { useTagInstances } from './hooks/useTagInstances'
import { FocusedNotesProvider, useFocusedNotes } from './FocusedNotesContext'
import { TagsProvider } from './TagsContext'
import type { Timeblock } from './types'
import Checklist, { type ChecklistRef } from './Checklist'

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

const TimerPageInner = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(0)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isAlarming, setIsAlarming] = useState(false)
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({})
  const [isPredicting, setIsPredicting] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const selectedSoundIndexRef = useRef(0)
  const prevSecondsRef = useRef<number | null>(null)
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checklistRef = useRef<ChecklistRef>(null)
  const { focusedNoteKeys } = useFocusedNotes()

  const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  const startDate = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()
  const { timeblocks, createTimeblock, patchTimeblockDebounced, refreshUnfocused } = useTimeblocks({ start: startIso, end: endIso })
  const { tagInstances, load: loadTagInstances, createTagInstance, approveTagInstance, deleteTagInstance } = useTagInstances({ start: startIso, end: endIso })

  const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

  const predictTagsForCurrentBlock = async () => {
    setIsPredicting(true)
    try {
      const currentBlockDatetime = floorTo15(new Date()).toISOString()
      const res = await fetch('/api/timer/predict-tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datetime: currentBlockDatetime }) })
      const json = await res.json()
      if (json.createdInstances?.length > 0) loadTagInstances()
      console.log('Prediction result:', json)
    } catch (e) {
      console.error('Prediction failed:', e)
    } finally {
      setIsPredicting(false)
    }
  }

  // Poll database every 5 seconds to refresh unfocused notes, tag instances, and checklist
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnfocused(focusedNoteKeys)
      loadTagInstances()
      checklistRef.current?.refreshItems()
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshUnfocused, focusedNoteKeys, loadTagInstances])

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
      if (shouldAlarm) {
        playAlarm()
        showNotification()
        startAlarming()
        // Reset all items to unchecked
        checklistRef.current?.resetAllItems()
        // Automatically predict tags for the just-completed block
        predictTagsForCurrentBlock()
        // Play alarm multiple times to be more noticeable
        setTimeout(playAlarm, 500)
        setTimeout(playAlarm, 1000)
        setTimeout(playAlarm, 2000)
        setTimeout(playAlarm, 3000)
      }
      prevSecondsRef.current = remaining
      setSecondsRemaining(remaining)
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isAlarming) {
      document.title = formatTime(secondsRemaining)
    }
  }, [secondsRemaining, isAlarming])

  useEffect(() => {
    playAlarm()
  }, [selectedSoundIndex])

  return (
    <div className="p-4 text-sm" onClick={isAlarming ? stopAlarming : undefined}>
      <div className="mb-4">
        <div className="text-2xl font-bold mb-2">
          {formatTime(secondsRemaining)}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label>Alarm Sound:</label>
          <select
            value={selectedSoundIndex}
            onChange={(e) => setSelectedSoundIndex(Number(e.target.value))}
            className="px-2 py-1 bg-gray-100 outline-none"
          >
            {ALARM_SOUNDS.map((sound, index) => (
              <option key={index} value={index}>
                {sound.name}
              </option>
            ))}
          </select>
          {notificationPermission === 'default' && (
            <button onClick={requestNotificationPermission} className="px-2 py-1 bg-blue-100">
              Enable Notifications
            </button>
          )}
          {notificationPermission === 'granted' && <span className="text-green-600">Notifications on</span>}
          {notificationPermission === 'denied' && <span className="text-red-600">Notifications blocked</span>}
          <button onClick={predictTagsForCurrentBlock} disabled={isPredicting} className="px-2 py-1 bg-purple-100 disabled:opacity-50">
            {isPredicting ? 'Predicting...' : 'Predict Tags'}
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {Array.from({ length: 14 }).map((_, i) => {
            const day = new Date()
            day.setDate(day.getDate() - i)
            day.setHours(0, 0, 0, 0)
            const key = day.toISOString().slice(0, 10)
            const isCollapsed = collapsedDays[key] ?? (i !== 0)
            return (
              <DaySection
                key={key}
                day={day}
                isCollapsed={isCollapsed}
                onToggleCollapsed={() => setCollapsedDays(prev => ({ ...prev, [key]: !(prev[key] ?? (i !== 0)) }))}
                timeblocks={timeblocks}
                tagInstances={tagInstances}
                onCreateTimeblock={async (args) => {
                  const tb = await createTimeblock(args)
                  return tb as Timeblock
                }}
                onPatchTimeblockDebounced={patchTimeblockDebounced}
                onCreateTagInstance={createTagInstance}
                onApproveTagInstance={approveTagInstance}
                onDeleteTagInstance={deleteTagInstance}
              />
            )
          })}
        </div>
        <div className="w-72">
          <TagSidebar tagInstances={tagInstances} />
        </div>
      </div>
      <Checklist ref={checklistRef} />
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const TimerPage = ({}:{}) => (
  <FocusedNotesProvider>
    <TagsProvider>
      <TimerPageInner />
    </TagsProvider>
  </FocusedNotesProvider>
)

export default TimerPage

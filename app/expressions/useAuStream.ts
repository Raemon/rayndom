'use client'
import { useEffect, useRef, useState } from 'react'

export type AuFrame = {
  ts: string
  detector: string
  inferenceMs: number
  faceDetected: boolean
  aus: Record<string, number>
}

export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

const SIDECAR_URL = 'ws://localhost:7681/ws/au-stream'
const RECONNECT_DELAY_MS = 2000

export const useAuStream = ({ enabled }:{ enabled: boolean }) => {
  const [frame, setFrame] = useState<AuFrame | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enabledRef = useRef(enabled)

  useEffect(() => { enabledRef.current = enabled }, [enabled])

  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
      if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null }
      setStatus('idle')
      return
    }

    const connect = () => {
      if (!enabledRef.current) return
      setStatus('connecting')
      setErrorMessage(null)
      let ws: WebSocket
      try {
        ws = new WebSocket(SIDECAR_URL)
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : String(err))
        scheduleReconnect()
        return
      }
      wsRef.current = ws

      ws.onopen = () => setStatus('open')
      ws.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data)
          if (parsed && parsed.error) {
            setErrorMessage(String(parsed.error))
            return
          }
          setFrame(parsed as AuFrame)
        } catch {
          // ignore malformed frames
        }
      }
      ws.onerror = () => {
        setStatus('error')
        setErrorMessage('WebSocket error (is the sidecar running on port 7681?)')
      }
      ws.onclose = () => {
        wsRef.current = null
        setStatus('closed')
        scheduleReconnect()
      }
    }

    const scheduleReconnect = () => {
      if (!enabledRef.current) return
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
    }

    connect()

    return () => {
      if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null }
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    }
  }, [enabled])

  return { frame, status, errorMessage }
}

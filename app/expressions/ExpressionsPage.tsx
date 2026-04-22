'use client'
import { useEffect, useState } from 'react'
import { useAuStream } from './useAuStream'
import LiveAuDashboard from './LiveAuDashboard'
import DerivedStatesPanel from './DerivedStatesPanel'

const statusColor: Record<string, string> = {
  idle: 'text-neutral-500',
  connecting: 'text-amber-600',
  open: 'text-emerald-600',
  closed: 'text-neutral-500',
  error: 'text-red-600',
}

const SIDECAR_HEALTH_URL = 'http://localhost:7681/health'

const useSidecarHealth = () => {
  const [up, setUp] = useState<boolean | null>(null)
  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch(SIDECAR_HEALTH_URL, { cache: 'no-store' })
        if (!cancelled) setUp(res.ok)
      } catch {
        if (!cancelled) setUp(false)
      }
    }
    check()
    const interval = setInterval(check, 3000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])
  return up
}

const ExpressionsPage = () => {
  const sidecarUp = useSidecarHealth()
  const [running, setRunning] = useState(false)
  // Auto-start streaming once the sidecar comes up (saves an extra click).
  useEffect(() => { if (sidecarUp) setRunning(true) }, [sidecarUp])

  const { frame, status, errorMessage } = useAuStream({ enabled: running && sidecarUp === true })
  const aus = frame?.aus ?? {}

  return (
    <div className="p-4 max-w-3xl mx-auto font-mono text-sm">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setRunning(r => !r)}
          disabled={!sidecarUp}
          className="px-2 py-0.5 border border-neutral-400 dark:border-neutral-600 disabled:opacity-40"
        >
          {running ? 'stop' : 'start'}
        </button>
        <span className={statusColor[status]}>{status}</span>
        {frame && (
          <span className="text-neutral-500">
            {frame.detector} · {frame.inferenceMs}ms · face: {frame.faceDetected ? 'yes' : 'no'}
          </span>
        )}
        {errorMessage && <span className="text-red-600 text-xs truncate">{errorMessage}</span>}
      </div>

      {sidecarUp === false && (
        <div className="text-xs mb-4 p-2 bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-400">
          Sidecar isn&apos;t running. In another terminal:
          <pre className="mt-1 text-xs select-all">npm run expressions:sidecar</pre>
          First run downloads model weights (~few hundred MB) and may take a minute. The page will auto-connect when it&apos;s up.
        </div>
      )}

      <div className="mb-6">
        <div className="text-xs uppercase text-neutral-500 mb-1">best guess</div>
        <DerivedStatesPanel aus={aus} />
      </div>

      <div>
        <div className="text-xs uppercase text-neutral-500 mb-1">raw action units</div>
        <LiveAuDashboard aus={aus} />
      </div>

      <div className="text-xs text-neutral-500 mt-6 leading-5">
        Heuristic mapping based on D&apos;Mello (confusion: AU4+AU7) and FACS literature (frustration: AU4+AU17+AU23; tension: AU4+AU7+AU24).
        These are a starting point, not validated for you specifically. Per Barrett et al. 2019, AU-to-emotion mapping is probabilistic and context-dependent.
      </div>
    </div>
  )
}

export default ExpressionsPage

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Ar5ivViewer from './Ar5ivViewer'
import HackerNewsIframe from './HackerNewsIframe'
import ProxyContentViewer from './ProxyContentViewer'

const IFRAME_TRANSITION_MS = 300
const DEFAULT_PANEL_PCT = 50
const MIN_PANEL_PCT = 20
const MAX_PANEL_PCT = 80

type ViewMode = 'iframe' | 'html'

export const useStoryPanel = () => {
  const [panelUrl, setPanelUrl] = useState<string | null>(null)
  const [panelVisible, setPanelVisible] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('iframe')
  const [panelPct, setPanelPct] = useState(DEFAULT_PANEL_PCT)
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const panelOpenRef = useRef(false)

  useEffect(() => {
    return () => { document.documentElement.removeAttribute('data-iframe-open') }
  }, [])

  const openPanel = useCallback((url: string, preferHtml?: boolean) => {
    setViewMode(preferHtml ? 'html' : 'iframe')
    setPanelUrl(url)
    if (!panelOpenRef.current) {
      panelOpenRef.current = true
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setPanelVisible(true)
        document.documentElement.setAttribute('data-iframe-open', '')
      }))
    }
  }, [])

  const closePanel = useCallback(() => {
    setPanelVisible(false)
    panelOpenRef.current = false
    document.documentElement.removeAttribute('data-iframe-open')
    setTimeout(() => { setPanelUrl(null); setPanelPct(DEFAULT_PANEL_PCT) }, IFRAME_TRANSITION_MS)
  }, [])

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    const onMouseMove = (me: MouseEvent) => {
      if (!isDraggingRef.current) return
      const pct = Math.min(MAX_PANEL_PCT, Math.max(MIN_PANEL_PCT, ((window.innerWidth - me.clientX) / window.innerWidth) * 100))
      setPanelPct(pct)
    }
    const onMouseUp = () => {
      isDraggingRef.current = false
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  useEffect(() => {
    if (!panelUrl) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [panelUrl, closePanel])

  return { panelUrl, panelVisible, viewMode, setViewMode, panelPct, isDragging, openPanel, closePanel, handleDividerMouseDown }
}

export const StoryPanel = ({ panelUrl, panelVisible, viewMode, setViewMode, panelPct, isDragging, handleDividerMouseDown, closePanel }: {
  panelUrl: string | null
  panelVisible: boolean
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  panelPct: number
  isDragging: boolean
  handleDividerMouseDown: (e: React.MouseEvent) => void
  closePanel: () => void
}) => (
  <>
    <style>{`
      main { transition: max-width ${IFRAME_TRANSITION_MS}ms ease-in-out; }
      html[data-iframe-open] main { max-width: ${100 - panelPct}vw; }
      html[data-iframe-open] { overflow: hidden; }
    `}</style>
    {isDragging && <div className="fixed inset-0 z-[60] cursor-col-resize select-none" />}
    {panelUrl && (
      <div
        className={`fixed top-0 right-0 h-screen z-50 bg-[#fffff8] border-l border-gray-500 transition-transform ease-in-out ${panelVisible ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: `${panelPct}vw`, transitionDuration: `${IFRAME_TRANSITION_MS}ms`, pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <div className="absolute left-0 top-0 h-full w-[5px] cursor-col-resize z-10 -translate-x-1/2" onMouseDown={handleDividerMouseDown} />
        <div className="flex items-center h-[28px] px-2 gap-1 bg-[#f5f5ec] text-[11px] font-[system-ui,sans-serif]">
          <button
            onClick={closePanel}
            aria-label="Close panel"
            title="Close (Esc)"
            className="flex items-center px-1 py-0.5 cursor-pointer border-0 bg-transparent text-[#999] hover:text-[#111]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {(['iframe', 'html'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{ color: viewMode === mode ? '#111' : '#999' }} className={`px-2 py-0.5 cursor-pointer border-0 bg-transparent ${viewMode === mode ? 'underline underline-offset-2' : ''}`}>{mode}</button>
          ))}
        </div>
        <div className="h-[calc(100vh-28px)]">
          {viewMode === 'iframe'
            ? <HackerNewsIframe url={panelUrl} />
            : /arxiv\.org\//.test(panelUrl) ? <Ar5ivViewer url={panelUrl} />
            : <ProxyContentViewer url={panelUrl} />}
        </div>
      </div>
    )}
  </>
)

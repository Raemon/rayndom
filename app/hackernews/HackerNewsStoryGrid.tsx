'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Ar5ivViewer from './Ar5ivViewer'
import HackerNewsIframe from './HackerNewsIframe'
import ProxyContentViewer from './ProxyContentViewer'
import HackerNewsStoryRow, { ClickedSide } from './HackerNewsStoryRow'
import { StoryCard } from './hackerNewsTypes'

const LOADING_SNIPPET = 'Loading article text...'
const FALLBACK_SNIPPET = 'No readable body text found for this URL.'
const SNIPPET_WORKER_COUNT = 3
const STORIES_PER_ROW = 5

const snippetCache = new Map<number, { snippet: string; snippetHtml: string }>()

const updateStoryCardSnippet = (cards: StoryCard[], storyId: number, snippet: string, snippetHtml: string) => {
  return cards.map(card => card.id === storyId ? { ...card, snippet, snippetHtml } : card)
}

const fetchStorySnippet = async (storyId: number) => {
  const cached = snippetCache.get(storyId)
  if (cached) return cached
  try {
    const response = await fetch(`/api/hackernews/story-snippet?id=${storyId}`, { method: 'GET', cache: 'no-store' })
    if (!response.ok) return { snippet: FALLBACK_SNIPPET, snippetHtml: '' }
    const payload = await response.json() as { snippet?: unknown, snippetHtml?: unknown }
    const snippet = typeof payload.snippet === 'string' && payload.snippet.trim() ? payload.snippet : FALLBACK_SNIPPET
    const snippetHtml = typeof payload.snippetHtml === 'string' ? payload.snippetHtml : ''
    snippetCache.set(storyId, { snippet, snippetHtml })
    return { snippet, snippetHtml }
  } catch {
    return { snippet: FALLBACK_SNIPPET, snippetHtml: '' }
  }
}

const buildStoryRows = (storyCards: StoryCard[]) => {
  const rows: StoryCard[][] = []
  for (let storyIndex = 0; storyIndex < storyCards.length; storyIndex += STORIES_PER_ROW) {
    rows.push(storyCards.slice(storyIndex, storyIndex + STORIES_PER_ROW))
  }
  return rows
}

type ViewMode = 'iframe' | 'html'
type IframeState = { url: string, rowIndex: number, side: ClickedSide }

const IFRAME_TRANSITION_MS = 300

const DEFAULT_PANEL_PCT = 50
const MIN_PANEL_PCT = 20
const MAX_PANEL_PCT = 80

const HackerNewsStoryGrid = ({ initialCards }:{ initialCards: StoryCard[] }) => {
  const [cards, setCards] = useState(initialCards)
  const [iframeState, setIframeState] = useState<IframeState | null>(null)
  const [iframeVisible, setIframeVisible] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('iframe')
  const iframeOpenRef = useRef(false)
  const [panelPct, setPanelPct] = useState(DEFAULT_PANEL_PCT)
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const storyIdsToHydrate = useMemo(() => initialCards.filter(card => card.snippet === LOADING_SNIPPET).map(card => card.id), [initialCards])
  const filteredCards = useMemo(() => cards.filter(card => card.snippet !== FALLBACK_SNIPPET), [cards])
  const storyRows = useMemo(() => buildStoryRows(filteredCards), [filteredCards])
  useEffect(() => {
    if (!storyIdsToHydrate.length) return
    let isCancelled = false
    let nextStoryIndex = 0
    const workerCount = Math.min(SNIPPET_WORKER_COUNT, storyIdsToHydrate.length)
    const workerIndexes = Array.from({ length: workerCount }, (_, index) => index)
    const processNextStory = async () => {
      while (!isCancelled) {
        const storyId = storyIdsToHydrate[nextStoryIndex]
        nextStoryIndex += 1
        if (storyId === undefined) return
        const { snippet, snippetHtml } = await fetchStorySnippet(storyId)
        if (isCancelled) return
        setCards(currentCards => updateStoryCardSnippet(currentCards, storyId, snippet, snippetHtml))
      }
    }
    for (const workerIndex of workerIndexes) {
      void workerIndex
      void processNextStory()
    }
    return () => {
      isCancelled = true
    }
  }, [storyIdsToHydrate])
  useEffect(() => {
    return () => { document.documentElement.removeAttribute('data-iframe-open') }
  }, [])
  const handleCloseIframe = useCallback(() => {
    setIframeVisible(false)
    iframeOpenRef.current = false
    document.documentElement.removeAttribute('data-iframe-open')
    setTimeout(() => { setIframeState(null); setPanelPct(DEFAULT_PANEL_PCT) }, IFRAME_TRANSITION_MS)
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
  const handleStoryClick = useCallback((rowIndex: number) => (url: string, side: ClickedSide) => {
    const card = filteredCards.find(c => c.url === url)
    setViewMode(card?.iframe === false ? 'html' : 'iframe')
    setIframeState({ url, rowIndex, side })
    if (!iframeOpenRef.current) {
      iframeOpenRef.current = true
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setIframeVisible(true)
        document.documentElement.setAttribute('data-iframe-open', '')
      }))
    }
  }, [filteredCards])
  useEffect(() => {
    if (!iframeState) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseIframe() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [iframeState, handleCloseIframe])
  return (
    <>
      <style>{`
        main { transition: max-width ${IFRAME_TRANSITION_MS}ms ease-in-out; }
        html[data-iframe-open] main { max-width: ${100 - panelPct}vw; }
        html[data-iframe-open] { overflow: hidden; }
      `}</style>
      <div className="grid gap-y-12 font-[Georgia,serif]">
        {storyRows.map((rowStories, rowIndex) => (
          <HackerNewsStoryRow
            key={rowStories[0]?.id ?? rowIndex}
            rowStories={rowStories}
            rowIndex={rowIndex}
            onStoryClick={handleStoryClick(rowIndex)}
            clickedSide={iframeState?.rowIndex === rowIndex ? iframeState.side : null}
          />
        ))}
      </div>
      {isDragging && <div className="fixed inset-0 z-[60] cursor-col-resize select-none" />}
      {iframeState && (
        <div
          className={`fixed top-0 right-0 h-screen z-50 bg-[#fffff8] border-l border-gray-500 transition-transform ease-in-out ${iframeVisible ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: `${panelPct}vw`, transitionDuration: `${IFRAME_TRANSITION_MS}ms`, pointerEvents: isDragging ? 'none' : 'auto' }}
        >
          <div className="absolute left-0 top-0 h-full w-[5px] cursor-col-resize z-10 -translate-x-1/2" onMouseDown={handleDividerMouseDown} />
          <div className="flex items-center h-[28px] px-2 gap-1 bg-[#f5f5ec] text-[11px] font-[system-ui,sans-serif]">
            {(['iframe', 'html'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`px-2 py-0.5 cursor-pointer border-0 bg-transparent ${viewMode === mode ? 'text-[#111] underline underline-offset-2' : 'text-[#999]'}`}>{mode}</button>
            ))}
          </div>
          <div className="h-[calc(100vh-28px)]">
            {viewMode === 'iframe'
              ? <HackerNewsIframe url={iframeState.url} />
              : /arxiv\.org\//.test(iframeState.url) ? <Ar5ivViewer url={iframeState.url} />
              : <ProxyContentViewer url={iframeState.url} />}
          </div>
        </div>
      )}
    </>
  )
}

export default HackerNewsStoryGrid

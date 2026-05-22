'use client'

import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { StoryCard } from './hackerNewsTypes'
import { StoryPanel, useStoryPanel } from './StoryPanel'

const extractPoints = (card: StoryCard): number | null => {
  const match = card.byline.match(/^(-?\d+)\s+points?/i)
  return match ? parseInt(match[1], 10) : null
}

const extractScore = (card: StoryCard): number | null => {
  if (card.relevance != null) return card.relevance
  return extractPoints(card)
}

// HN's public ranking formula applied generically to any source with a points
// byline (HN, LW). Real HN folds in penalty factors we don't have; LW's actual
// ranking is different again — this is a reasonable "fresh + popular" proxy.
const siteAlgorithmScore = (card: StoryCard): number | null => {
  const points = extractPoints(card)
  if (points == null || !card.postedAt) return null
  const t = new Date(card.postedAt).getTime()
  if (Number.isNaN(t)) return null
  const ageHours = (Date.now() - t) / 3_600_000
  if (ageHours < 0) return null
  return (points - 1) / Math.pow(ageHours + 2, 1.8)
}

const dayKey = (iso: string | undefined): string => {
  if (!iso) return 'undated'
  const d = new Date(iso)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

// Date-only display, pinned to UTC so server and client render the same string.
const formatImported = (iso: string | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

const buildDayLabeler = () => {
  const now = new Date()
  const todayKey = dayKey(now.toISOString())
  const yesterdayKey = dayKey(new Date(now.getTime() - 86400000).toISOString())
  return (key: string): string => {
    if (key === 'undated') return 'Undated'
    if (key === todayKey) return 'Today'
    if (key === yesterdayKey) return 'Yesterday'
    const d = new Date(`${key}T00:00:00Z`)
    return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' })
  }
}

type SnippetMode = 'html' | 'twoLine'
type SortKey = 'default' | 'relevance' | 'points' | 'siteAlgorithm' | 'postedAt'
type SortDir = 'desc' | 'asc'

const SORT_LABELS: Record<SortKey, string> = {
  default: 'Default',
  relevance: 'AI rating',
  points: 'Site points',
  siteAlgorithm: 'Site algorithm',
  postedAt: 'Date published',
}

const SNIPPET_LABELS: Record<SnippetMode, string> = { html: 'HTML', twoLine: 'Two-line' }

const sortValue = (card: StoryCard, key: SortKey): number | null => {
  if (key === 'relevance') return card.relevance ?? null
  if (key === 'points') return extractPoints(card)
  if (key === 'siteAlgorithm') return siteAlgorithmScore(card)
  if (key === 'postedAt') {
    if (!card.postedAt) return null
    const t = new Date(card.postedAt).getTime()
    return Number.isNaN(t) ? null : t
  }
  return null
}

const isSortKey = (s: string | null): s is SortKey =>
  s === 'default' || s === 'relevance' || s === 'points' || s === 'siteAlgorithm' || s === 'postedAt'
const isSortDir = (s: string | null): s is SortDir => s === 'desc' || s === 'asc'
const isSnippetMode = (s: string | null): s is SnippetMode => s === 'html' || s === 'twoLine'

const updateUrlParam = (key: string, value: string | null) => {
  const params = new URLSearchParams(window.location.search)
  if (value == null) params.delete(key)
  else params.set(key, value)
  const query = params.toString()
  window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname)
}

const COLLAPSED_SNIPPET_MAX_H = 180
const SNIPPET_TRANSITION_MS = 300

// When expanded, grow to the snippet's full height but never taller than this, so a
// long snippet can't push the rest of the list off-screen. Floored at the collapsed
// height so expanding never shrinks the preview on very short viewports.
const expandedSnippetCap = () => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return Math.max(window.innerHeight - 20 * rem, COLLAPSED_SNIPPET_MAX_H)
}

// Rich-HTML snippet that shows a faded 180px preview by default and animates out to
// its full height (capped at expandedSnippetCap) when expanded. We measure
// scrollHeight at click time and animate max-height to that pixel value (rather than
// a fixed large value) so the grow is smooth. The fade stays whenever content is
// still clipped. Clicks on links inside the snippet don't toggle.
const HtmlSnippet = ({ html, expanded, onToggle }: {
  html: string
  expanded: boolean
  onToggle: () => void
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [maxH, setMaxH] = useState(COLLAPSED_SNIPPET_MAX_H)
  const [clamped, setClamped] = useState(false)
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return
    const el = ref.current
    if (el) {
      if (expanded) {
        setMaxH(COLLAPSED_SNIPPET_MAX_H)
        setClamped(false)
      } else {
        const cap = expandedSnippetCap()
        setMaxH(Math.min(el.scrollHeight, cap))
        setClamped(el.scrollHeight > cap)
      }
    }
    onToggle()
  }
  const faded = !expanded || clamped
  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{ maxHeight: maxH, transitionDuration: `${SNIPPET_TRANSITION_MS}ms` }}
      className={`m-0 mt-1 text-[14px] text-[#444] leading-[1.4] overflow-hidden cursor-pointer break-words transition-[max-height] ease-in-out [&_a]:text-[#1f1f1f] [&_a]:underline [&_a]:underline-offset-2 [&_p]:my-[0.7em] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:overflow-hidden [&_img]:hidden ${faded ? '[mask-image:linear-gradient(to_bottom,black_70%,transparent)]' : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

const StoryList = ({ cards, showScore }: { cards: StoryCard[], showScore: boolean }) => {
  const panel = useStoryPanel()
  const searchParams = useSearchParams()

  const availableSortKeys = useMemo<SortKey[]>(() => {
    const keys: SortKey[] = ['default']
    if (cards.some(c => c.relevance != null)) keys.push('relevance')
    if (cards.some(c => extractPoints(c) != null)) keys.push('points')
    if (cards.some(c => extractPoints(c) != null && c.postedAt)) keys.push('siteAlgorithm')
    if (cards.some(c => c.postedAt)) keys.push('postedAt')
    return keys
  }, [cards])

  const [snippetMode, setSnippetModeState] = useState<SnippetMode>(() => {
    const v = searchParams.get('snippet')
    return isSnippetMode(v) ? v : 'html'
  })
  const [sortKey, setSortKeyState] = useState<SortKey>(() => {
    const v = searchParams.get('sort')
    return isSortKey(v) && availableSortKeys.includes(v) ? v : 'default'
  })
  const [sortDir, setSortDirState] = useState<SortDir>(() => {
    const v = searchParams.get('dir')
    return isSortDir(v) ? v : 'desc'
  })
  const [overrides, setOverrides] = useState<Set<string>>(new Set())

  const effectiveSortKey: SortKey = availableSortKeys.includes(sortKey) ? sortKey : 'default'

  const setSnippetMode = (mode: SnippetMode) => {
    if (mode === snippetMode) return
    setSnippetModeState(mode)
    setOverrides(new Set())
    updateUrlParam('snippet', mode === 'html' ? null : mode)
  }
  const setSortKey = (key: SortKey) => {
    setSortKeyState(key)
    updateUrlParam('sort', key === 'default' ? null : key)
  }
  const setSortDir = (dir: SortDir) => {
    setSortDirState(dir)
    updateUrlParam('dir', dir === 'desc' ? null : dir)
  }

  const toggleOverride = (url: string) => {
    setOverrides(prev => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  const sortedCards = useMemo(() => {
    if (effectiveSortKey === 'default') return cards
    return [...cards].sort((a, b) => {
      const av = sortValue(a, effectiveSortKey)
      const bv = sortValue(b, effectiveSortKey)
      if (av === bv) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av - bv
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [cards, effectiveSortKey, sortDir])

  const groups = useMemo(() => {
    if (effectiveSortKey !== 'default' && effectiveSortKey !== 'postedAt') {
      return [{ key: 'all', label: null as string | null, cards: sortedCards }]
    }
    const map = new Map<string, StoryCard[]>()
    for (const card of sortedCards) {
      const key = dayKey(card.postedAt)
      const bucket = map.get(key) ?? []
      bucket.push(card)
      map.set(key, bucket)
    }
    const dayDir = effectiveSortKey === 'postedAt' ? sortDir : 'desc'
    const sortedKeys = [...map.keys()].sort((a, b) => {
      if (a === 'undated') return 1
      if (b === 'undated') return -1
      return dayDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    })
    const labelFor = buildDayLabeler()
    return sortedKeys.map(key => ({ key, label: labelFor(key) as string | null, cards: map.get(key)! }))
  }, [sortedCards, effectiveSortKey, sortDir])

  const gridCols = showScore ? 'grid-cols-[48px_1fr_180px_100px]' : 'grid-cols-[1fr_180px_100px]'

  return (
    <>
      <StoryPanel {...panel} />
      <div className="max-w-[900px] mx-auto font-[Georgia,serif] text-[#1f1f1f]">
        <div className="flex gap-4 items-baseline justify-end mb-3 font-sans flex-wrap">
          <label className="text-[12px] text-[#666] flex items-baseline gap-1">
            Sort by
            <select
              value={effectiveSortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-transparent border border-[#ddd] text-[#333] text-[12px] py-0.5 px-1 cursor-pointer"
            >
              {availableSortKeys.map(k => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </label>
          {effectiveSortKey !== 'default' && (
            <button
              onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
              aria-label={`Sort direction: ${sortDir === 'desc' ? 'descending' : 'ascending'}`}
              className="text-[12px] text-[#333] hover:text-[#1f1f1f] bg-transparent border-0 cursor-pointer p-0"
            >{sortDir === 'desc' ? '↓ Desc' : '↑ Asc'}</button>
          )}
          <div className="flex gap-3 items-baseline">
            {(['html', 'twoLine'] as SnippetMode[]).map(m => (
              <button
                key={m}
                onClick={() => setSnippetMode(m)}
                className="text-[12px] bg-transparent border-0 cursor-pointer whitespace-nowrap p-0"
                style={{ color: snippetMode === m ? '#1f1f1f' : '#999', textDecoration: snippetMode === m ? 'underline' : 'none', textUnderlineOffset: '4px' }}
              >{SNIPPET_LABELS[m]}</button>
            ))}
          </div>
        </div>
        {groups.map(group => (
          <section key={group.key} className="mb-8">
            {group.label && (
              <h2 className="font-sans text-[11px] uppercase tracking-[1px] text-[#999] border-b border-[#ddd] pb-1 mb-2 mt-0">{group.label}</h2>
            )}
            {group.cards.map(card => {
              const score = showScore ? extractScore(card) : null
              const isOverridden = overrides.has(card.url)
              // In HTML mode, clicking expands the snippet to full height; in
              // two-line mode it reveals the (still-capped) HTML preview.
              const showHtml = !!card.snippetHtml && (snippetMode === 'html' || isOverridden)
              const expanded = snippetMode === 'html' && isOverridden
              return (
                <article key={card.url} className={`grid ${gridCols} gap-x-4 py-3 border-b border-[#eee] items-baseline`}>
                  {showScore && (
                    <div className="relative group text-[18px] text-[#666] font-sans tabular-nums text-right pt-1">
                      {score ?? ''}
                      {card.reason && (
                        <div className="hidden group-hover:block absolute left-full top-0 ml-2 z-10 w-[280px] p-2 bg-white border border-[#ddd] shadow-md text-left text-[12px] font-[Georgia,serif] italic text-[#8b6914] leading-[1.4] normal-nums">{card.reason}</div>
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <a
                      href={card.url}
                      onClick={(e) => { e.preventDefault(); panel.openPanel(card.url, card.iframe === false) }}
                      className="text-[16px] leading-[1.3] text-[#1f1f1f] hover:text-[#555] no-underline hover:underline cursor-pointer"
                    >{card.title}</a>
                    {card.snippet && (
                      showHtml ? (
                        <HtmlSnippet
                          html={card.snippetHtml!}
                          expanded={expanded}
                          onToggle={() => toggleOverride(card.url)}
                        />
                      ) : card.snippetHtml ? (
                        <p
                          onClick={() => toggleOverride(card.url)}
                          className="m-0 mt-1 text-[13px] text-[#666] leading-[1.4] line-clamp-2 cursor-pointer"
                        >{card.snippet}</p>
                      ) : (
                        <p className="m-0 mt-1 text-[13px] text-[#666] leading-[1.4] line-clamp-2">{card.snippet}</p>
                      )
                    )}
                  </div>
                  <div className="text-[12px] text-[#999] italic text-right pt-1">{card.byline}</div>
                  <div className="text-[12px] text-[#999] text-right pt-1 whitespace-nowrap">{formatImported(card.importedAt)}</div>
                </article>
              )
            })}
          </section>
        ))}
      </div>
    </>
  )
}

export default StoryList

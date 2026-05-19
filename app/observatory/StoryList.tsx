'use client'

import { useMemo, useState } from 'react'
import { StoryCard } from './hackerNewsTypes'
import { StoryPanel, useStoryPanel } from './StoryPanel'

const extractScore = (card: StoryCard): number | null => {
  if (card.relevance != null) return card.relevance
  const match = card.byline.match(/^(-?\d+)\s+points?/i)
  return match ? parseInt(match[1], 10) : null
}

const dayKey = (iso: string | undefined): string => {
  if (!iso) return 'undated'
  const d = new Date(iso)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
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

const StoryList = ({ cards, showScore }: { cards: StoryCard[], showScore: boolean }) => {
  const panel = useStoryPanel()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpanded = (url: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  const groups = useMemo(() => {
    const map = new Map<string, StoryCard[]>()
    for (const card of cards) {
      const key = dayKey(card.postedAt)
      const bucket = map.get(key) ?? []
      bucket.push(card)
      map.set(key, bucket)
    }
    const sortedKeys = [...map.keys()].sort((a, b) => {
      if (a === 'undated') return 1
      if (b === 'undated') return -1
      return b.localeCompare(a)
    })
    const labelFor = buildDayLabeler()
    return sortedKeys.map(key => ({ key, label: labelFor(key), cards: map.get(key)! }))
  }, [cards])

  const gridCols = showScore ? 'grid-cols-[48px_1fr_180px]' : 'grid-cols-[1fr_180px]'

  return (
    <>
      <StoryPanel {...panel} />
      <div className="max-w-[900px] mx-auto font-[Georgia,serif] text-[#1f1f1f]">
        {groups.map(group => (
          <section key={group.key} className="mb-8">
            <h2 className="font-sans text-[11px] uppercase tracking-[1px] text-[#999] border-b border-[#ddd] pb-1 mb-2 mt-0">{group.label}</h2>
            {group.cards.map(card => {
              const score = showScore ? extractScore(card) : null
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
                  <div>
                    <a
                      href={card.url}
                      onClick={(e) => { e.preventDefault(); panel.openPanel(card.url, card.iframe === false) }}
                      className="text-[16px] leading-[1.3] text-[#1f1f1f] hover:text-[#555] no-underline hover:underline cursor-pointer"
                    >{card.title}</a>
                    {card.snippet && (
                      expanded.has(card.url) && card.snippetHtml ? (
                        <div
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('a')) return
                            toggleExpanded(card.url)
                          }}
                          className="m-0 mt-1 text-[13px] text-[#666] leading-[1.4] max-h-[150px] overflow-hidden cursor-pointer break-words [mask-image:linear-gradient(to_bottom,black_70%,transparent)] [&_a]:text-[#666] [&_a]:no-underline [&_p]:mt-0 [&_p]:mb-[0.4em] [&_pre]:overflow-hidden [&_img]:hidden"
                          dangerouslySetInnerHTML={{ __html: card.snippetHtml }}
                        />
                      ) : card.snippetHtml ? (
                        <p
                          onClick={() => toggleExpanded(card.url)}
                          className="m-0 mt-1 text-[13px] text-[#666] leading-[1.4] line-clamp-2 cursor-pointer"
                        >{card.snippet}</p>
                      ) : (
                        <p className="m-0 mt-1 text-[13px] text-[#666] leading-[1.4] line-clamp-2">{card.snippet}</p>
                      )
                    )}
                  </div>
                  <div className="text-[12px] text-[#999] italic text-right pt-1">{card.byline}</div>
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

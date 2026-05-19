'use client'

import { useState } from 'react'
import { StoryCard } from './hackerNewsTypes'
import { StoryPanel, useStoryPanel } from './StoryPanel'

type SortKey = 'default' | 'postedAt' | 'relevance'
type SortDir = 'asc' | 'desc'

const StoryTable = ({ cards, showRelevance }: { cards: StoryCard[], showRelevance: boolean }) => {
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const panel = useStoryPanel()

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'desc') setSortDir('asc')
      else { setSortKey('default'); setSortDir('desc') }
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const effectiveSortKey: SortKey = sortKey === 'relevance' && !showRelevance ? 'default' : sortKey
  const sortedCards = effectiveSortKey === 'default' ? cards : [...cards].sort((a, b) => {
    let cmp = 0
    if (effectiveSortKey === 'relevance') {
      cmp = (a.relevance ?? 0) - (b.relevance ?? 0)
    } else if (effectiveSortKey === 'postedAt') {
      cmp = (a.postedAt ?? '').localeCompare(b.postedAt ?? '')
    }
    return sortDir === 'desc' ? -cmp : cmp
  })

  const sortIndicator = (key: SortKey) => effectiveSortKey === key ? (sortDir === 'desc' ? ' \u25BC' : ' \u25B2') : ''

  return (
    <>
    <StoryPanel {...panel} />
    <table className="w-full border-collapse font-sans text-[#1f1f1f] table-fixed">
      <colgroup>
        {showRelevance ? (
          <>
            <col style={{ width: '24%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '11%' }} />
          </>
        ) : (
          <>
            <col style={{ width: '30%' }} />
            <col style={{ width: '50%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '13%' }} />
          </>
        )}
      </colgroup>
      <thead>
        <tr className="text-left text-[12px] uppercase tracking-[0.5px] text-[#999] border-b border-[#ddd]">
          <th className="py-2 pr-5 font-medium">Title</th>
          <th className="py-2 pr-5 font-medium">Snippet</th>
          {showRelevance && <th className="py-2 pr-5 font-medium">Reason</th>}
          <th className="py-2 pr-5 font-medium cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort('postedAt')}>
            Posted{sortIndicator('postedAt')}
          </th>
          {showRelevance && (
            <th className="py-2 pr-5 font-medium cursor-pointer select-none" onClick={() => toggleSort('relevance')}>
              Rating{sortIndicator('relevance')}
            </th>
          )}
          <th className="py-2 font-medium">Metadata</th>
        </tr>
      </thead>
      <tbody>
        {sortedCards.map(card => (
          <tr key={card.url} className="border-b border-[#eee] hover:bg-[#f9f9f0] align-top">
            <td className="py-2 pr-5 leading-[1.4] font-[Georgia,serif]">
              <a
                href={card.url}
                onClick={(e) => { e.preventDefault(); panel.openPanel(card.url, card.iframe === false) }}
                className="text-[16px] text-[#1f1f1f] hover:text-[#555] no-underline hover:underline cursor-pointer"
              >{card.title}</a>
              <a href={`https://${card.domain}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#777] italic font-sans mt-0.5 block no-underline hover:underline">{card.domain}</a>
            </td>
            <td className="py-2 pr-5 text-[13px] text-[#666]">
              {card.snippetHtml ? (
                <div
                  className="m-0 break-words line-clamp-4 [&_a]:text-[#666] [&_a]:no-underline [&_p]:mt-0 [&_p]:mb-[0.4em] [&_pre]:overflow-hidden [&_img]:hidden"
                  dangerouslySetInnerHTML={{ __html: card.snippetHtml }}
                />
              ) : (
                <div className="m-0 line-clamp-4">{card.snippet}</div>
              )}
            </td>
            {showRelevance && (
              <td className="py-2 pr-5 text-[13px] text-[#8b6914] italic">{card.reason && <div className="m-0 line-clamp-4">{card.reason}</div>}</td>
            )}
            <td className="py-2 pr-5 text-[12px] text-[#999] whitespace-nowrap">
              {card.postedAt && new Date(card.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </td>
            {showRelevance && <td className="py-2 pr-5 text-[13px] text-[#999] text-center">{card.relevance ?? '–'}</td>}
            <td className="py-2 text-[12px] text-[#999]">
              {card.byline.split(/\s*[·,]\s*/).map((part, i, arr) => (
                <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </>
  )
}

export default StoryTable

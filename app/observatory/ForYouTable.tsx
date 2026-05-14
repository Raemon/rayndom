'use client'

import { useState } from 'react'
import { StoryCard } from './hackerNewsTypes'

const htmlToText = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/ {2,}/g, ' ').trim()

type SortKey = 'default' | 'postedAt' | 'relevance'
type SortDir = 'asc' | 'desc'

const ForYouTable = ({ cards }: { cards: StoryCard[] }) => {
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'desc') setSortDir('asc')
      else { setSortKey('default'); setSortDir('desc') }
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedCards = sortKey === 'default' ? cards : [...cards].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'relevance') {
      cmp = (a.relevance ?? 0) - (b.relevance ?? 0)
    } else if (sortKey === 'postedAt') {
      cmp = (a.postedAt ?? '').localeCompare(b.postedAt ?? '')
    }
    return sortDir === 'desc' ? -cmp : cmp
  })

  const sortIndicator = (key: SortKey) => sortKey === key ? (sortDir === 'desc' ? ' \u25BC' : ' \u25B2') : ''

  return (
    <table className="w-full border-collapse font-[Georgia,serif] text-[#1f1f1f] table-fixed">
      <colgroup>
        <col style={{ width: '22%' }} />
        <col style={{ width: '6%' }} />
        <col style={{ width: '29%' }} />
        <col style={{ width: '23%' }} />
        <col style={{ width: '5%' }} />
        <col style={{ width: '6%' }} />
        <col style={{ width: '9%' }} />
      </colgroup>
      <thead>
        <tr className="text-left text-[12px] uppercase tracking-[0.5px] text-[#999] border-b border-[#ddd]">
          <th className="py-2 pr-5 font-medium">Title</th>
          <th className="py-2 pr-5 font-medium">Source</th>
          <th className="py-2 pr-5 font-medium">Snippet</th>
          <th className="py-2 pr-5 font-medium">Reason</th>
          <th className="py-2 pr-5 font-medium cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort('postedAt')}>
            Posted{sortIndicator('postedAt')}
          </th>
          <th className="py-2 pr-5 font-medium cursor-pointer select-none" onClick={() => toggleSort('relevance')}>
            Rating{sortIndicator('relevance')}
          </th>
          <th className="py-2 font-medium">Metadata</th>
        </tr>
      </thead>
      <tbody>
        {sortedCards.map(card => (
          <tr key={card.url} className="border-b border-[#eee] hover:bg-[#f9f9f0] align-top">
            <td className="py-2 pr-5 leading-[1.4]">
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[16px] text-[#1f1f1f] hover:text-[#555] no-underline hover:underline"
              >{card.title}</a>
            </td>
            <td className="py-2 pr-5 text-[13px] text-[#777] italic">{card.domain}</td>
            <td className="py-2 pr-5 text-[13px] text-[#666] font-sans"><div className="m-0 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical]">{card.snippetHtml ? htmlToText(card.snippetHtml) : card.snippet}</div></td>
            <td className="py-2 pr-5 text-[13px] text-[#8b6914] italic font-sans">{card.reason && <div className="m-0 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical]">{card.reason}</div>}</td>
            <td className="py-2 pr-5 text-[12px] text-[#999] whitespace-nowrap">
              {card.postedAt && new Date(card.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </td>
            <td className="py-2 pr-5 text-[13px] text-[#999] text-center">{card.relevance ?? '–'}</td>
            <td className="py-2 text-[12px] text-[#999]">
              {card.byline.split(/\s*[·,]\s*/).map((part, i, arr) => (
                <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ForYouTable

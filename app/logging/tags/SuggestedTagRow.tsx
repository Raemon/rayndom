'use client'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Tag } from '../types'
import type { TagCounts } from './tagUtils'
import { getTagColor } from './tagUtils'

const SuggestedTagRow = ({ tag, counts, onClick, isSelected, dimmed, extra, onMouseEnter, onMouseLeave, onContextMenu }:{
  tag: Tag,
  counts?: TagCounts,
  onClick?: () => void,
  isSelected?: boolean,
  dimmed?: boolean,
  extra?: ReactNode,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  onContextMenu?: () => void,
}) => {
  const color = getTagColor(tag.name)
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div className={`flex items-center gap-2 text-sm relative ${onClick ? ' cursor-pointer' : ''}${dimmed ? ' opacity-40' : ''}`} onClick={onClick} onMouseEnter={() => { setIsHovered(true); onMouseEnter?.() }} onMouseLeave={() => { setIsHovered(false); onMouseLeave?.() }} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onContextMenu?.() }}>
      <span className="px-2 py-1 my-1 text-white whitespace-nowrap border rounded-xs" style={{ backgroundColor: isSelected || isHovered ? color : color.replace(')', ', 0.2)').replace('hsl(', 'hsla('), borderColor: "rgba(255, 255, 255, 0.36)" }}>{tag.name}</span>
      {extra && <span className={isHovered ? 'visible' : 'invisible'}>{extra}</span>}
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-green-400 w-5 flex-shrink-0 text-right">{counts?.positive ? `+${counts.positive}` : ''}</span>
        {counts?.negative ? <span className="text-red-400 flex-shrink-0">-{counts.negative}</span> : null}
        <span className="text-white/40 w-4 flex-shrink-0 text-right">{counts?.total ?? ''}</span>
      </div>
      {isSelected && tag.suggestedTagIds?.length ? <span className="text-white/40 pointer-events-none absolute -right-8">▶</span> : null}
    </div>
  )
}

export default SuggestedTagRow

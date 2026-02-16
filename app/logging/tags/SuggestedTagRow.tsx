'use client'
import { useState } from 'react'
import type { Tag } from '../types'
import type { TagCounts } from './tagUtils'
import { getTagColor } from './tagUtils'

const SuggestedTagRow = ({ tag, counts, onClick, isSelected, onMouseEnter, onMouseLeave, onContextMenu }:{
  tag: Tag,
  counts?: TagCounts,
  onClick?: () => void,
  isSelected?: boolean,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  onContextMenu?: () => void,
}) => {
  const color = getTagColor(tag.name)
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div className={`flex items-center gap-2 text-sm relative ${onClick ? ' cursor-pointer' : ''}`} onClick={onClick} onMouseEnter={() => { setIsHovered(true); onMouseEnter?.() }} onMouseLeave={() => { setIsHovered(false); onMouseLeave?.() }} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onContextMenu?.() }}>
      <div className="flex items-center justify-end gap-1 w-16 pr-[6px]">
        <span className="text-green-400 w-5 flex-shrink-0 text-right">{counts?.positive ? `+${counts.positive}` : ''}</span>
        {counts?.negative ? <span className="text-red-400 flex-shrink-0">-{counts.negative}</span> : null}
        <span className="text-white/40 w-4 flex-shrink-0 text-right">{counts?.total ?? ''}</span>
      </div>
      <span className="px-3 py-2 my-1 text-white w-full shrink-0 flex-1 whitespace-nowrap border rounded-xs" style={{ backgroundColor: isSelected || isHovered ? color : color.replace(')', ', 0.2)').replace('hsl(', 'hsla('), borderColor: "rgba(255, 255, 255, 0.1)" }}>{tag.name}</span>
      {isSelected && tag.suggestedTagIds?.length ? <span className="text-white/40 pointer-events-none absolute -right-8">▶</span> : null}
    </div>
  )
}

export default SuggestedTagRow

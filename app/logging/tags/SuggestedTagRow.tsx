'use client'
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
  return (
    <div className={`flex items-center gap-2 text-sm relative ${onClick ? ' cursor-pointer hover:bg-white/10' : ''}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onContextMenu?.() }}>
      <div className="flex items-center justify-end gap-2 w-16 pr-[6px]">
        {counts?.positive ? <span className="text-green-400">+{counts.positive}</span> : null}
        {counts?.negative ? <span className="text-red-400">-{counts.negative}</span> : null}
        {counts ? <span className="text-white/40">{counts.total}</span> : null}
      </div>
      <span className="px-3 py-2 my-1 text-white flex-1 whitespace-nowrap" style={{ backgroundColor: isSelected ? color : color.replace(')', ', 0.2)').replace('hsl(', 'hsla('), borderColor: color }}>{tag.name}</span>
      {isSelected && tag.suggestedTagIds?.length ? <span className="text-white/40 pointer-events-none absolute -right-8">▶</span> : null}
    </div>
  )
}

export default SuggestedTagRow

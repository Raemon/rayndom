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
  const showFlowArrow = !!isSelected && !!tag.suggestedTagIds?.length
  return (
    <div className={`relative flex items-center gap-2 text-sm  ${onClick ? ' cursor-pointer hover:bg-white/10' : ''}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onContextMenu?.() }}>
      <div className="flex items-center justify-end gap-2 w-16 pr-[6px]">
        {counts?.positive ? <span className="text-green-400">+{counts.positive}</span> : null}
        {counts?.negative ? <span className="text-red-400">-{counts.negative}</span> : null}
        {counts ? <span className="text-white/40">{counts.total}</span> : null}
      </div>
      <span className="px-3 py-2 my-1 text-white flex-1 border whitespace-nowrap" style={{ backgroundColor: isSelected ? color : color.replace(')', ', 0.1)').replace('hsl(', 'hsla('), borderColor: color }}>{tag.name}</span>
      {showFlowArrow ? <span className="absolute right-[-3.75rem] top-1/2 -translate-y-1/2 text-white/40 text-3xl leading-none pointer-events-none">›</span> : null}
    </div>
  )
}

export default SuggestedTagRow

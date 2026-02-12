'use client'
import type { Tag } from '../types'
import type { TagCounts } from './tagUtils'
import { getTagColor } from './tagUtils'

const SuggestedTagRow = ({ tag, counts, onClick }:{
  tag: Tag,
  counts?: TagCounts,
  onClick?: () => void,
}) => {
  return (
    <div className={`flex items-center gap-2 text-sm  ${onClick ? ' cursor-pointer hover:bg-white/10' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-end gap-2 w-12 pr-[6px]">
        {counts?.positive ? <span className="text-green-400">+{counts.positive}</span> : null}
        {counts?.negative ? <span className="text-red-400">-{counts.negative}</span> : null}
        {counts ? <span className="text-white/40">{counts.total}</span> : null}
      </div>
      <span className="px-3 py-2 my-1 text-white border-b-[1px] border-b-white/10 w-full" style={{ borderLeft: `10px solid ${getTagColor(tag.name)}` }}>{tag.name}</span>
    </div>
  )
}

export default SuggestedTagRow

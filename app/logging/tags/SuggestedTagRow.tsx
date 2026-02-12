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
      <div className="flex items-center gap-2 w-10">
        {counts?.positive ? <span className="text-green-400">+{counts.positive}</span> : null}
        {counts?.negative ? <span className="text-red-400">-{counts.negative}</span> : null}
        {!counts ? <span className="text-white/40">{tag.type}</span> : null}
      </div>
      <span className="p-2 text-white" style={{ backgroundColor: getTagColor(tag.name) }}>{tag.name}</span>
    </div>
  )
}

export default SuggestedTagRow

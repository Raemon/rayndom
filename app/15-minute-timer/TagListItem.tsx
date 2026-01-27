'use client'
import type { Tag } from './types'

const TagListItem = ({ tag, instanceCount, onClick }:{
  tag: Tag,
  instanceCount: number,
  onClick: () => void,
}) => {
  return (
    <button className="text-left w-full bg-transparent flex" onClick={onClick}>
      <span className="text-gray-400 mr-1 w-8 text-center text-xs">{instanceCount}</span>
      <span>{tag.name}</span>
    </button>
  )
}

export default TagListItem

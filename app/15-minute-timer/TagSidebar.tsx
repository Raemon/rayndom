'use client'
import { useState } from 'react'
import groupBy from 'lodash/groupBy'
import countBy from 'lodash/countBy'
import TagListItem from './TagListItem'
import { useTags } from './TagsContext'
import type { Tag, TagInstance } from './types'

const NewTagForm = () => {
  const { createTag } = useTags()
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const handleSubmit = async () => {
    if (!name.trim() || !type.trim()) return
    await createTag({ name: name.trim(), type: type.trim() })
    setName('')
    setType('')
  }
  return (
    <div className="mt-2 flex gap-1">
      <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="Type" className="w-20 px-1 bg-gray-100 outline-none" />
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="flex-1 px-1 bg-gray-100 outline-none" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
      <button onClick={handleSubmit} className="px-2 bg-gray-600">+</button>
    </div>
  )
}

const TagSidebar = ({ tagInstances }:{ tagInstances: TagInstance[] }) => {
  const { tags } = useTags()
  const tagsByType: Record<string, Tag[]> = groupBy(tags, 'type')
  const instanceCountByTagId: Record<string, number> = countBy(tagInstances, 'tagId')
  const typeNames = Object.keys(tagsByType).sort()

  return (
    <div className="text-sm">
      <div className="font-semibold mb-1">Tags</div>
      {typeNames.map((typeName, idx) => (
        <div key={typeName} className={idx > 0 ? 'mt-3' : ''}>
          <div className="text-lg text-gray-500 mb-1">{typeName}</div>
          <div className="flex flex-col gap-1">
            {tagsByType[typeName].map(tag => (
              <TagListItem key={tag.id} tag={tag} instanceCount={instanceCountByTagId[tag.id] || 0} />
            ))}
          </div>
        </div>
      ))}
      <NewTagForm />
    </div>
  )
}

export default TagSidebar

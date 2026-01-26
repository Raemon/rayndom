'use client'
import { useState } from 'react'
import groupBy from 'lodash/groupBy'
import countBy from 'lodash/countBy'
import TagEditor from './TagEditor'
import type { Tag, TagInstance } from './types'

const NewTagForm = ({ onCreateTag }:{ onCreateTag: (args: { name: string, type: string }) => Promise<Tag> }) => {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const handleSubmit = async () => {
    if (!name.trim() || !type.trim()) return
    await onCreateTag({ name: name.trim(), type: type.trim() })
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

const TagSidebar = ({ tags, tagInstances, onUpdateTag, onDeleteTag, onCreateTag }:{
  tags: Tag[],
  tagInstances: TagInstance[],
  onUpdateTag: (args: { id: number, name?: string, type?: string }) => Promise<void> | void,
  onDeleteTag: (args: { id: number }) => Promise<void> | void,
  onCreateTag: (args: { name: string, type: string }) => Promise<Tag>,
}) => {
  const [editingTagId, setEditingTagId] = useState<number | null>(null)

  const tagsByType: Record<string, Tag[]> = groupBy(tags, 'type')
  const instanceCountByTagId: Record<string, number> = countBy(tagInstances, 'tagId')
  const typeNames = Object.keys(tagsByType).sort()

  return (
    <div className="text-sm">
      <div className="font-semibold mb-1">Tags</div>
      {typeNames.map((typeName, idx) => (
        <div key={typeName} className={idx > 0 ? 'mt-3' : ''}>
          <div className="text-lg text-gray-500 mb-1">{typeName}</div>
          <div className="flex flex-col">
            {tagsByType[typeName].map(tag => (
              <div key={tag.id}>
                {editingTagId === tag.id ? (
                  <TagEditor
                    tag={tag}
                    onSave={async ({ id, name, type }) => { await onUpdateTag({ id, name, type }); setEditingTagId(null) }}
                    onDelete={async ({ id }) => { await onDeleteTag({ id }); setEditingTagId(null) }}
                  />
                ) : (
                  <button className="text-left w-full bg-transparent flex justify-between" onClick={() => setEditingTagId(tag.id)}>
                    <span>{tag.name}</span>
                    <span className="text-gray-500">{instanceCountByTagId[tag.id] || 0}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <NewTagForm onCreateTag={onCreateTag} />
    </div>
  )
}

export default TagSidebar

'use client'
import { useMemo, useState } from 'react'
import TagEditor from './TagEditor'
import TagTypeahead from './TagTypeahead'
import type { Tag, TagInstance } from './types'

const formatHm = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

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
      <button onClick={handleSubmit} className="px-2 bg-gray-200">+</button>
    </div>
  )
}

const TagSidebar = ({ tags, tagInstances, onUpdateTag, onDeleteTag, onDeleteTagInstance, onCreateTag, onCreateTagInstance }:{
  tags: Tag[],
  tagInstances: TagInstance[],
  onUpdateTag: (args: { id: number, name?: string, type?: string }) => Promise<void> | void,
  onDeleteTag: (args: { id: number }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
  onCreateTag: (args: { name: string, type: string }) => Promise<Tag>,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
}) => {
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const groupedInstances = useMemo(() => {
    const map = new Map<string, TagInstance[]>()
    for (const ti of tagInstances) {
      const type = ti.tag?.type || tags.find(t => t.id === ti.tagId)?.type || ''
      map.set(type, [...(map.get(type) || []), ti])
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [tagInstances, tags])

  const tagsByType = useMemo(() => {
    const map = new Map<string, Tag[]>()
    for (const tag of tags) map.set(tag.type, [...(map.get(tag.type) || []), tag])
    return map
  }, [tags])

  return (
    <div className="text-sm">
      {groupedInstances.map(([type, instances]) => (
        <div key={type} className="mb-4">
          <div className="font-semibold mb-1">{type || 'Other'}</div>
          <div className="flex flex-col gap-1">
            {instances.map(ti => (
              <div key={ti.id} className="flex items-center gap-2">
                <div className="w-14 text-gray-600">{formatHm(new Date(ti.datetime))}</div>
                <div className="flex-1">{ti.tag?.name || tags.find(t => t.id === ti.tagId)?.name}</div>
                <button className="text-gray-600" onClick={() => onDeleteTagInstance({ id: ti.id })}>×</button>
                <TagTypeahead
                  tags={tagsByType.get(type) || []}
                  placeholder="Change"
                  onSelectTag={async (tag) => {
                    await onDeleteTagInstance({ id: ti.id })
                    await onCreateTagInstance({ tagId: tag.id, datetime: ti.datetime })
                  }}
                  onCreateTag={async (name) => {
                    const created = await onCreateTag({ name, type })
                    return created
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-4">
        <div className="font-semibold mb-1">Tags</div>
        <div className="flex flex-col gap-1">
          {tags.map(tag => (
            <div key={tag.id}>
              {editingTagId === tag.id ? (
                <TagEditor
                  tag={tag}
                  onSave={async ({ id, name, type }) => { await onUpdateTag({ id, name, type }); setEditingTagId(null) }}
                  onDelete={async ({ id }) => { await onDeleteTag({ id }); setEditingTagId(null) }}
                />
              ) : (
                <button className="text-left w-full" onClick={() => setEditingTagId(tag.id)}>{tag.type}: {tag.name}</button>
              )}
            </div>
          ))}
        </div>
        <NewTagForm onCreateTag={onCreateTag} />
      </div>
    </div>
  )
}

export default TagSidebar

'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import groupBy from 'lodash/groupBy'
import TimeBlockRow from '../../timer/TimeBlockRow'
import { TagsProvider, useTags } from '../../tags/TagsContext'
import { getTagColor } from '../../tags/tagUtils'
import type { Tag, TagInstance, Timeblock } from '../../types'

const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)
const formatDate = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
const formatHm = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

const TagDetailPageInner = () => {
  const params = useParams()
  const tagId = Number(params.tagId)
  const { tags } = useTags()
  const [tag, setTag] = useState<Tag | null>(null)
  const [timeblocks, setTimeblocks] = useState<Timeblock[]>([])
  const [allTagInstances, setAllTagInstances] = useState<TagInstance[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/timer/tag-detail?tagId=${tagId}`)
    const json = await res.json()
    setTag(json.tag || null)
    setTimeblocks(json.timeblocks || [])
    setAllTagInstances(json.allTagInstances || [])
    setLoading(false)
  }, [tagId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])
  const tagTypes = useMemo(() => {
    const availableTypes = ['Projects', 'Triggers', 'Techniques']
    return availableTypes.filter(t => tags.some(tag => tag.type === t))
  }, [tags])
  const slots = useMemo(() => {
    const datetimes = [...new Set(allTagInstances.filter(ti => ti.tagId === tagId).map(ti => floorTo15(new Date(ti.datetime)).getTime()))]
    return datetimes.sort((a, b) => b - a)
  }, [allTagInstances, tagId])
  const slotToTimeblock = useMemo(() => {
    const map = new Map<number, Timeblock>()
    for (const tb of timeblocks) {
      const slotMs = floorTo15(new Date(tb.datetime)).getTime()
      map.set(slotMs, tb)
    }
    return map
  }, [timeblocks])
  const tagInstancesBySlot = useMemo(() => {
    const map = new Map<string, TagInstance[]>()
    for (const ti of allTagInstances) {
      const slotMs = floorTo15(new Date(ti.datetime)).getTime()
      const type = ti.tag?.type || tags.find(t => t.id === ti.tagId)?.type || ''
      const key = `${slotMs}:${type}`
      map.set(key, [...(map.get(key) || []), ti])
    }
    return map
  }, [allTagInstances, tags])
  const slotsByDate = useMemo(() => {
    const groups: { date: string, slots: number[] }[] = []
    const dateMap = new Map<string, number[]>()
    for (const slotMs of slots) {
      const d = new Date(slotMs)
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!dateMap.has(dateKey)) { dateMap.set(dateKey, []); groups.push({ date: dateKey, slots: dateMap.get(dateKey)! }) }
      dateMap.get(dateKey)!.push(slotMs)
    }
    return groups
  }, [slots])
  const createTimeblock = async (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => {
    const res = await fetch('/api/timer/timeblocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
    const json = await res.json()
    if (json.timeblock) setTimeblocks(prev => [...prev, json.timeblock])
    return json.timeblock as Timeblock
  }
  const patchTimeblockDebounced = (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => {
    setTimeblocks(prev => prev.map(tb => tb.id === args.id ? { ...tb, rayNotes: args.rayNotes ?? tb.rayNotes, assistantNotes: args.assistantNotes ?? tb.assistantNotes, aiNotes: args.aiNotes ?? tb.aiNotes } : tb))
    fetch('/api/timer/timeblocks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
  }
  const createTagInstance = async (args: { tagId: number, datetime: string, approved?: boolean }) => {
    const res = await fetch('/api/timer/tag-instances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
    const json = await res.json()
    if (json.tagInstance) setAllTagInstances(prev => [...prev, json.tagInstance])
    return json.tagInstance as TagInstance
  }
  const approveTagInstance = async (args: { id: number }) => {
    setAllTagInstances(prev => prev.map(ti => ti.id === args.id ? { ...ti, approved: true } : ti))
    await fetch('/api/timer/tag-instances', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: args.id, approved: true }) })
  }
  const patchTagInstance = async (args: { id: number, useful?: boolean, antiUseful?: boolean }) => {
    setAllTagInstances(prev => prev.map(ti => ti.id === args.id ? { ...ti, useful: args.useful ?? ti.useful, antiUseful: args.antiUseful ?? ti.antiUseful } : ti))
    await fetch('/api/timer/tag-instances', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
  }
  const deleteTagInstance = async (args: { id: number }) => {
    setAllTagInstances(prev => prev.filter(ti => ti.id !== args.id))
    await fetch(`/api/timer/tag-instances?id=${args.id}`, { method: 'DELETE' })
  }
  if (loading) return <div className="p-4 text-white/50 text-sm">Loading...</div>
  if (!tag) return <div className="p-4 text-white/50 text-sm">Tag not found</div>
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-0.5 text-white text-sm" style={{ backgroundColor: getTagColor(tag.name) }}>{tag.name}</span>
        <span className="text-white/50 text-xs">{tag.type}</span>
        <span className="text-white/50 text-xs">· {slots.length} entries</span>
      </div>
      {tag.description && <div className="text-white/60 text-xs mb-4">{tag.description}</div>}
      {slotsByDate.map(({ date, slots: dateSlots }) => {
        const dateLabel = formatDate(new Date(dateSlots[0]))
        return (
          <div key={date} className="mb-2">
            <div className="text-white/70 text-xs font-semibold mb-1">{dateLabel}</div>
            <table className="w-full">
              <tbody>
                {dateSlots.map(slotMs => {
                  const slotStart = new Date(slotMs)
                  const tb = slotToTimeblock.get(slotMs)
                  return (
                    <TimeBlockRow
                      key={slotMs}
                      slotStart={slotStart}
                      timeLabel={formatHm(slotStart)}
                      timeblock={tb}
                      tagTypes={tagTypes}
                      tagInstancesByType={Object.fromEntries(tagTypes.map(type => {
                        const key = `${slotMs}:${type}`
                        return [type, tagInstancesBySlot.get(key) || []]
                      }))}
                      allTagInstances={allTagInstances}
                      onCreateTimeblock={createTimeblock}
                      onPatchTimeblockDebounced={patchTimeblockDebounced}
                      onCreateTagInstance={createTagInstance}
                      onApproveTagInstance={approveTagInstance}
                      onPatchTagInstance={patchTagInstance}
                      onDeleteTagInstance={deleteTagInstance}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

const TagDetailPage = () => (
  <TagsProvider>
    <TagDetailPageInner />
  </TagsProvider>
)

export default TagDetailPage

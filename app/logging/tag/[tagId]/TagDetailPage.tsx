'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import groupBy from 'lodash/groupBy'
import TimeBlockRow from '../../timer/TimeBlockRow'
import { TagsProvider, useTags } from '../../tags/TagsContext'
import { FocusedNotesProvider } from '../../context/FocusedNotesContext'
import { getTagColor } from '../../tags/tagUtils'
import type { Tag, TagInstance, Timeblock } from '../../types'
import { getApiErrorMessage } from '../../lib/optimisticApi'
import { runOptimisticMutation } from '../../lib/optimisticMutation'

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
    const optimistic: Timeblock = { id: -Date.now(), datetime: args.datetime, rayNotes: args.rayNotes ?? null, assistantNotes: args.assistantNotes ?? null, aiNotes: args.aiNotes ?? null }
    const timeblock = await runOptimisticMutation({
      applyOptimistic: () => {
        setTimeblocks(prev => [...prev, optimistic])
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/timer/timeblocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to create timeblock (${res.status})`))
        return (json as { timeblock?: Timeblock }).timeblock as Timeblock
      },
      commit: (created) => {
        if (created) setTimeblocks(prev => prev.map(tb => tb.id === optimistic.id ? created : tb))
      },
      rollback: () => {
        setTimeblocks(prev => prev.filter(tb => tb.id !== optimistic.id))
      },
    })
    return timeblock
  }
  const patchTimeblockDebounced = (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => {
    const previousTimeblock = timeblocks.find(tb => tb.id === args.id)
    if (!previousTimeblock) return
    runOptimisticMutation({
      applyOptimistic: () => {
        setTimeblocks(prev => prev.map(tb => tb.id === args.id ? { ...tb, rayNotes: args.rayNotes ?? tb.rayNotes, assistantNotes: args.assistantNotes ?? tb.assistantNotes, aiNotes: args.aiNotes ?? tb.aiNotes } : tb))
        return previousTimeblock
      },
      request: async () => {
        const res = await fetch('/api/timer/timeblocks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to update timeblock (${res.status})`))
        return json as { timeblock?: Timeblock }
      },
      commit: (json) => {
        if (json.timeblock) setTimeblocks(prev => prev.map(tb => tb.id === args.id ? json.timeblock as Timeblock : tb))
      },
      rollback: (previousTimeblock) => {
        setTimeblocks(prev => prev.map(tb => tb.id === args.id ? previousTimeblock : tb))
      },
      rethrow: false,
    })
  }
  const createTagInstance = async (args: { tagId: number, datetime: string, approved?: boolean }) => {
    const optimistic: TagInstance = { id: -Date.now(), tagId: args.tagId, datetime: args.datetime, approved: args.approved ?? true, llmPredicted: false, tag: tags.find(t => t.id === args.tagId) }
    const tagInstance = await runOptimisticMutation({
      applyOptimistic: () => {
        setAllTagInstances(prev => [...prev, optimistic])
        return optimistic
      },
      request: async () => {
        const res = await fetch('/api/timer/tag-instances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(getApiErrorMessage(json, `Failed to create tag instance (${res.status})`))
        return (json as { tagInstance?: TagInstance }).tagInstance as TagInstance
      },
      commit: (created) => {
        if (created) setAllTagInstances(prev => prev.map(ti => ti.id === optimistic.id ? created : ti))
      },
      rollback: () => {
        setAllTagInstances(prev => prev.filter(ti => ti.id !== optimistic.id))
      },
    })
    return tagInstance
  }
  const approveTagInstance = async (args: { id: number }) => {
    const previousTagInstance = allTagInstances.find(ti => ti.id === args.id)
    if (!previousTagInstance) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setAllTagInstances(prev => prev.map(ti => ti.id === args.id ? { ...ti, approved: true } : ti))
        return previousTagInstance
      },
      request: async () => {
        const res = await fetch('/api/timer/tag-instances', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: args.id, approved: true }) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to approve tag instance (${res.status})`))
        }
        return true
      },
      rollback: (previousTagInstance) => {
        setAllTagInstances(prev => prev.map(ti => ti.id === args.id ? previousTagInstance : ti))
      },
      rethrow: false,
    })
  }
  const patchTagInstance = async (args: { id: number, useful?: boolean, antiUseful?: boolean }) => {
    const previousTagInstance = allTagInstances.find(ti => ti.id === args.id)
    if (!previousTagInstance) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setAllTagInstances(prev => prev.map(ti => ti.id === args.id ? { ...ti, useful: args.useful ?? ti.useful, antiUseful: args.antiUseful ?? ti.antiUseful } : ti))
        return previousTagInstance
      },
      request: async () => {
        const res = await fetch('/api/timer/tag-instances', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to update tag instance (${res.status})`))
        }
        return true
      },
      rollback: (previousTagInstance) => {
        setAllTagInstances(prev => prev.map(ti => ti.id === args.id ? previousTagInstance : ti))
      },
      rethrow: false,
    })
  }
  const deleteTagInstance = async (args: { id: number }) => {
    const previousTagInstanceIndex = allTagInstances.findIndex(ti => ti.id === args.id)
    const previousTagInstance = allTagInstances.find(ti => ti.id === args.id)
    if (!previousTagInstance) return
    await runOptimisticMutation({
      applyOptimistic: () => {
        setAllTagInstances(prev => prev.filter(ti => ti.id !== args.id))
        return { previousTagInstanceIndex, previousTagInstance }
      },
      request: async () => {
        const res = await fetch(`/api/timer/tag-instances?id=${args.id}`, { method: 'DELETE' })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(json, `Failed to delete tag instance (${res.status})`))
        }
        return true
      },
      rollback: ({ previousTagInstanceIndex, previousTagInstance }) => {
        setAllTagInstances(prev => {
          if (prev.some(ti => ti.id === previousTagInstance.id)) return prev
          const next = [...prev]
          const insertIndex = previousTagInstanceIndex >= 0 && previousTagInstanceIndex <= next.length ? previousTagInstanceIndex : next.length
          next.splice(insertIndex, 0, previousTagInstance)
          return next
        })
      },
      rethrow: false,
    })
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
    <FocusedNotesProvider>
      <TagDetailPageInner />
    </FocusedNotesProvider>
  </TagsProvider>
)

export default TagDetailPage

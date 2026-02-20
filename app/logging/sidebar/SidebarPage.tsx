'use client'
import { useMemo, useEffect, useState } from 'react'
import { TagsProvider, useTags } from '../tags/TagsContext'
import { useTagInstances } from '../hooks/useTagInstances'
import TagCell from '../tags/TagCell'
import Checklist from '../checklist/Checklist'
import { getCurrentSection } from '../checklist/sectionUtils'

const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

const SidebarPageInner = () => {
  const [currentSection, setCurrentSection] = useState(getCurrentSection())
  const currentBlockDatetime = floorTo15(new Date()).toISOString()
  const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  const startDate = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()
  const { tagInstances, load: loadTagInstances, createTagInstance, approveTagInstance, patchTagInstance, deleteTagInstance } = useTagInstances({ start: startIso, end: endIso })
  const { tags } = useTags()
  const slotMs = useMemo(() => floorTo15(new Date(currentBlockDatetime)).getTime(), [currentBlockDatetime])
  const tagInstancesForCurrentBlock = useMemo(() =>
    tagInstances.filter(ti => floorTo15(new Date(ti.datetime)).getTime() === slotMs),
  [tagInstances, slotMs])
  const tagTypes = useMemo(() => {
    const availableTypes = ['Projects', 'Triggers', 'Techniques']
    const filtered = availableTypes.filter(t => tags.some(tag => tag.type === t))
    if (tags.length > 0 && filtered.length === 0) {
      return [...new Set(tags.map(t => t.type))].sort()
    }
    return filtered
  }, [tags])
  const tagInstancesByType = useMemo(() => {
    const byType: Record<string, typeof tagInstancesForCurrentBlock> = {}
    for (const type of tagTypes) byType[type] = []
    for (const ti of tagInstancesForCurrentBlock) {
      const type = ti.tag?.type || tags.find(t => t.id === ti.tagId)?.type || ''
      if (byType[type]) byType[type].push(ti)
    }
    return byType
  }, [tagInstancesForCurrentBlock, tagTypes, tags])
  useEffect(() => {
    const interval = setInterval(() => setCurrentSection(getCurrentSection()), 30000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const interval = setInterval(() => loadTagInstances(), 5000)
    return () => clearInterval(interval)
  }, [loadTagInstances])
  return (
    <div className="w-[400px] flex flex-col gap-4 overflow-y-auto p-4 text-sm">
      <div className="flex flex-col gap-2">
        <div className="font-semibold">Tags for {new Date(currentBlockDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
        {tagTypes.map(type => (
          <div key={type}>
            <div className="text-xs text-white/60 mb-1">{type}</div>
            <TagCell
              type={type}
              tagInstances={tagInstancesByType[type] || []}
              allTagInstances={tagInstances}
              datetime={currentBlockDatetime}
              onCreateTagInstance={createTagInstance}
              onApproveTagInstance={approveTagInstance}
              onPatchTagInstance={patchTagInstance}
              onDeleteTagInstance={deleteTagInstance}
            />
          </div>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        <Checklist inline section={currentSection} />
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const SidebarPage = ({}:{}) => (
  <TagsProvider>
    <SidebarPageInner />
  </TagsProvider>
)

export default SidebarPage

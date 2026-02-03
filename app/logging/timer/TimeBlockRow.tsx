'use client'
import { useState } from 'react'
import NotesInput from '../editor/NotesInput'
import TagCell from '../tags/TagCell'
import OrientingChecklist from '../checklist/OrientingChecklist'
import type { TagInstance, Timeblock } from '../types'

const TimeBlockRow = ({ slotStart, timeLabel, timeblock, tagTypes, tagInstancesByType, allTagInstances, isCurrent, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  slotStart: Date,
  timeLabel: string,
  timeblock?: Timeblock,
  tagTypes: string[],
  tagInstancesByType: Record<string, TagInstance[]>,
  allTagInstances: TagInstance[],
  isCurrent?: boolean,
  onCreateTimeblock: (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null }) => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, debounceMs?: number }) => void,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onApproveTagInstance: (args: { id: number }) => Promise<void> | void,
  onPatchTagInstance: (args: { id: number, useful?: boolean, antiUseful?: boolean }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const ensureTimeblock = async () => {
    if (timeblock) return timeblock
    const created = await onCreateTimeblock({ datetime: slotStart.toISOString(), rayNotes: null, assistantNotes: null, aiNotes: null })
    return created
  }

  const handleToggleOrient = () => {
    setIsExpanded(prev => !prev)
  }

  const isOrientingBlock = isExpanded
  return (
    <>
      <tr className={`${isCurrent ? 'bg-black/50' : ''} ${!isOrientingBlock ? 'border-b border-white/10' : ''}`}>
        <td className="text-gray-300 whitespace-nowrap px-2 py-2" style={{ width: '10%', verticalAlign: 'top' }}>
          <span className="flex items-center gap-1 cursor-pointer" onClick={handleToggleOrient}>
            {timeLabel}
            <button className="text-[10px]! text-white/20 ml-2 hover:text-white leading-none" title="Toggle orient block">{isOrientingBlock ? '▼' : '▶'}</button>
          </span>
        </td>
        {!isOrientingBlock && (
          <>
            <td style={{ width: '15%', verticalAlign: 'top' }} className="px-2 py-2">
              <NotesInput
                noteKey={timeblock ? `${timeblock.id}:rayNotes` : undefined}
                placeholder="Notes"
                initialValue={timeblock?.rayNotes || ''}
                externalValue={timeblock?.rayNotes || ''}
                datetime={slotStart.toISOString()}
                onCreateTagInstance={onCreateTagInstance}
                onDeleteTagInstance={onDeleteTagInstance}
                onSave={async (content) => {
                  const tb = await ensureTimeblock()
                  onPatchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 0 })
                }}
              />
            </td>
            <td style={{ width: '15%', verticalAlign: 'top' }} className="px-2 py-2">
              <NotesInput
                noteKey={timeblock ? `${timeblock.id}:assistantNotes` : undefined}
                placeholder="Asst"
                initialValue={timeblock?.assistantNotes || ''}
                externalValue={timeblock?.assistantNotes || ''}
                datetime={slotStart.toISOString()}
                onCreateTagInstance={onCreateTagInstance}
                onDeleteTagInstance={onDeleteTagInstance}
                onSave={async (content) => {
                  const tb = await ensureTimeblock()
                  onPatchTimeblockDebounced({ id: tb.id, assistantNotes: content, debounceMs: 0 })
                }}
              />
            </td>
            <td style={{ width: '15%', verticalAlign: 'top' }} className="px-2 py-2">
              <NotesInput
                noteKey={timeblock ? `${timeblock.id}:aiNotes` : undefined}
                placeholder="AI"
                initialValue={timeblock?.aiNotes || ''}
                externalValue={timeblock?.aiNotes || ''}
                datetime={slotStart.toISOString()}
                onCreateTagInstance={onCreateTagInstance}
                onDeleteTagInstance={onDeleteTagInstance}
                onSave={async (content) => {
                  const tb = await ensureTimeblock()
                  onPatchTimeblockDebounced({ id: tb.id, aiNotes: content, debounceMs: 0 })
                }}
              />
            </td>
          </>
        )}
        {isOrientingBlock && (
          <td colSpan={3} style={{ width: '45%', verticalAlign: 'top' }} className="px-2 py-2">
            <NotesInput
              noteKey={timeblock ? `${timeblock.id}:rayNotes` : undefined}
              placeholder="Notes"
              initialValue={timeblock?.rayNotes || ''}
              externalValue={timeblock?.rayNotes || ''}
              minHeight={800}
              noExpand
              datetime={slotStart.toISOString()}
              onCreateTagInstance={onCreateTagInstance}
              onDeleteTagInstance={onDeleteTagInstance}
              onSave={async (content) => {
                const tb = await ensureTimeblock()
                onPatchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 0 })
              }}
            />
          </td>
        )}
        {tagTypes.map(type => (
          <td key={type} className="px-2 py-2" style={{ width: `${45 / (tagTypes.length || 1)}%`, verticalAlign: 'top' }}>
            <TagCell
              type={type}
              tagInstances={tagInstancesByType[type] || []}
              allTagInstances={allTagInstances}
              datetime={slotStart.toISOString()}
              onCreateTagInstance={onCreateTagInstance}
              onApproveTagInstance={onApproveTagInstance}
              onPatchTagInstance={onPatchTagInstance}
              onDeleteTagInstance={onDeleteTagInstance}
            />
          </td>
        ))}
      </tr>
      {isOrientingBlock && (
        <tr className={isCurrent ? 'bg-orange-500/5 border-b border-white/10' : 'border-b border-white/10'}>
          <td></td>
          <td colSpan={3}></td>
          <td colSpan={tagTypes.length} className="px-2 py-2 relative" style={{ height: '1px' }}>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', maxWidth: '400px', width: '100%' }}>
              <OrientingChecklist maxWidth={400} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default TimeBlockRow

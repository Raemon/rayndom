'use client'
import { useRef } from 'react'
import NotesInput from './NotesInput'
import TagCell from './TagCell'
import Checklist from './Checklist'
import type { TagInstance, Timeblock } from './types'

const TimeBlockRow = ({ slotStart, timeLabel, timeblock, tagTypes, tagInstancesByType, allTagInstances, isCurrent, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onDeleteTagInstance }:{
  slotStart: Date,
  timeLabel: string,
  timeblock?: Timeblock,
  tagTypes: string[],
  tagInstancesByType: Record<string, TagInstance[]>,
  allTagInstances: TagInstance[],
  isCurrent?: boolean,
  onCreateTimeblock: (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, orientingBlock?: boolean }) => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, orientingBlock?: boolean, debounceMs?: number }) => void,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onApproveTagInstance: (args: { id: number }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)
  const ensureTimeblock = async () => {
    if (timeblock) return timeblock
    const created = await onCreateTimeblock({ datetime: slotStart.toISOString(), rayNotes: null, assistantNotes: null, aiNotes: null })
    return created
  }

  const handleTripleClick = async () => {
    const tb = await ensureTimeblock()
    const newOrientingBlock = !(tb.orientingBlock ?? false)
    onPatchTimeblockDebounced({ id: tb.id, orientingBlock: newOrientingBlock, debounceMs: 0 })
  }

  const handleClick = () => {
    clickCountRef.current += 1
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    if (clickCountRef.current === 3) {
      handleTripleClick()
      clickCountRef.current = 0
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0
      }, 500)
    }
  }

  const isOrientingBlock = timeblock?.orientingBlock ?? false
  const totalCols = 1 + 3 + tagTypes.length

  return (
    <>
      <tr className={`${isCurrent ? 'bg-orange-500/5' : ''} ${!isOrientingBlock ? 'border-b border-white/10' : ''}`} onClick={handleClick}>
        <td className="text-gray-300 whitespace-nowrap px-2 py-2" style={{ width: '10%', verticalAlign: 'top' }}>{timeLabel}</td>
        {!isOrientingBlock && (
          <td style={{ width: '15%', verticalAlign: 'top' }} className="px-2 py-2">
            <NotesInput
              noteKey={timeblock ? `${timeblock.id}:rayNotes` : undefined}
              placeholder="Notes"
              initialValue={timeblock?.rayNotes || ''}
              externalValue={timeblock?.rayNotes || ''}
              onSave={async (content) => {
                const tb = await ensureTimeblock()
                onPatchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 0 })
              }}
            />
          </td>
        )}
        {isOrientingBlock && <td style={{ width: '15%', verticalAlign: 'top' }} className="px-2 py-2"></td>}
        <td style={{ width: '15%', verticalAlign: 'top' }} className="px-2 py-2">
          <NotesInput
            noteKey={timeblock ? `${timeblock.id}:assistantNotes` : undefined}
            placeholder="Asst"
            initialValue={timeblock?.assistantNotes || ''}
            externalValue={timeblock?.assistantNotes || ''}
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
            onSave={async (content) => {
              const tb = await ensureTimeblock()
              onPatchTimeblockDebounced({ id: tb.id, aiNotes: content, debounceMs: 0 })
            }}
          />
        </td>
        {tagTypes.map(type => (
          <td key={type} className="px-2 py-2" style={{ width: `${45 / (tagTypes.length || 1)}%`, verticalAlign: 'top' }}>
            <TagCell
              type={type}
              tagInstances={tagInstancesByType[type] || []}
              allTagInstances={allTagInstances}
              datetime={slotStart.toISOString()}
              onCreateTagInstance={onCreateTagInstance}
              onApproveTagInstance={onApproveTagInstance}
              onDeleteTagInstance={onDeleteTagInstance}
            />
          </td>
        ))}
      </tr>
      {isOrientingBlock && (
        <tr className={isCurrent ? 'bg-orange-500/5 border-b border-white/10' : 'border-b border-white/10'} onClick={handleClick}>
          <td colSpan={totalCols} className="px-2 py-2">
            <div className="flex gap-4">
              <div style={{ width: '800px' }}>
                <NotesInput
                  noteKey={timeblock ? `${timeblock.id}:rayNotes` : undefined}
                  placeholder="Notes"
                  initialValue={timeblock?.rayNotes || ''}
                  externalValue={timeblock?.rayNotes || ''}
                  minHeight={800}
                  onSave={async (content) => {
                    const tb = await ensureTimeblock()
                    onPatchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 0 })
                  }}
                />
              </div>
              <Checklist orientingOnly inline />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default TimeBlockRow

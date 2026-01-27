'use client'
import NotesInput from './NotesInput'
import TagCell from './TagCell'
import { useTags } from './TagsContext'
import type { TagInstance, Timeblock } from './types'

const TimeBlockRow = ({ slotStart, timeLabel, timeblock, tagTypes, tagInstancesByType, allTagInstances, isCurrent, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTagInstance, onApproveTagInstance, onDeleteTagInstance }:{
  slotStart: Date,
  timeLabel: string,
  timeblock?: Timeblock,
  tagTypes: string[],
  tagInstancesByType: Record<string, TagInstance[]>,
  allTagInstances: TagInstance[],
  isCurrent?: boolean,
  onCreateTimeblock: (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null }) => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, debounceMs?: number }) => void,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onApproveTagInstance: (args: { id: number }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const { tags } = useTags()
  const ensureTimeblock = async () => {
    if (timeblock) return timeblock
    const created = await onCreateTimeblock({ datetime: slotStart.toISOString(), rayNotes: null, assistantNotes: null })
    return created
  }

  return (
    <tr className={isCurrent ? 'bg-orange-500/5' : ''}>
      <td className="text-gray-300 whitespace-nowrap px-2 py-2" style={{ width: '10%', verticalAlign: 'top' }}>{timeLabel}</td>
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
      {tagTypes.map(type => (
        <td key={type} className="px-2 py-2" style={{ width: `${60 / (tagTypes.length || 1)}%`, verticalAlign: 'top' }}>
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
  )
}

export default TimeBlockRow

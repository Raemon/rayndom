'use client'
import NotesInput from './NotesInput'
import TagCell from './TagCell'
import type { Tag, TagInstance, Timeblock } from './types'

const TimeBlockRow = ({ slotStart, timeLabel, timeblock, tagTypes, tags, tagInstancesByType, onCreateTimeblock, onPatchTimeblockDebounced, onCreateTag, onCreateTagInstance, onDeleteTagInstance }:{
  slotStart: Date,
  timeLabel: string,
  timeblock?: Timeblock,
  tagTypes: string[],
  tags: Tag[],
  tagInstancesByType: Record<string, TagInstance[]>,
  onCreateTimeblock: (args: { datetime: string, rayNotes?: string | null, assistantNotes?: string | null }) => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, debounceMs?: number }) => void,
  onCreateTag: (args: { name: string, type: string }) => Promise<Tag>,
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  const ensureTimeblock = async () => {
    if (timeblock) return timeblock
    const created = await onCreateTimeblock({ datetime: slotStart.toISOString(), rayNotes: null, assistantNotes: null })
    return created
  }

  return (
    <tr>
      <td className="text-gray-300 whitespace-nowrap px-2 py-2" style={{ width: '10%' }}>{timeLabel}</td>
      <td style={{ width: '15%', height: '100%' }} className="px-2 py-2">
        <NotesInput
          placeholder="Notes"
          value={timeblock?.rayNotes || ''}
          onSave={async (content) => {
            const tb = await ensureTimeblock()
            onPatchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 0 })
          }}
        />
      </td>
      <td style={{ width: '15%', height: '100%' }} className="px-2 py-2">
        <NotesInput
          placeholder="Asst"
          value={timeblock?.assistantNotes || ''}
          onSave={async (content) => {
            const tb = await ensureTimeblock()
            onPatchTimeblockDebounced({ id: tb.id, assistantNotes: content, debounceMs: 0 })
          }}
        />
      </td>
      {tagTypes.map(type => (
        <td key={type} className="px-2 py-2" style={{ width: `${60 / (tagTypes.length || 1)}%` }}>
          <TagCell
            type={type}
            tags={tags.filter(t => t.type === type)}
            tagInstances={tagInstancesByType[type] || []}
            datetime={slotStart.toISOString()}
            onCreateTag={onCreateTag}
            onCreateTagInstance={onCreateTagInstance}
            onDeleteTagInstance={onDeleteTagInstance}
          />
        </td>
      ))}
    </tr>
  )
}

export default TimeBlockRow

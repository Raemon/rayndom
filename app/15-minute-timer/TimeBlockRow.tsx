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
    <div className="flex items-center gap-2">
      <div className="w-14 text-gray-300 whitespace-nowrap w-20">{timeLabel}</div>
      <NotesInput
        placeholder="Notes"
        value={timeblock?.rayNotes || ''}
        onStartTyping={ensureTimeblock}
        onDebouncedChange={async (next: string) => {
          const tb = await ensureTimeblock()
          onPatchTimeblockDebounced({ id: tb.id, rayNotes: next })
        }}
      />
      <NotesInput
        placeholder="Asst"
        value={timeblock?.assistantNotes || ''}
        onStartTyping={ensureTimeblock}
        onDebouncedChange={async (next: string) => {
          const tb = await ensureTimeblock()
          onPatchTimeblockDebounced({ id: tb.id, assistantNotes: next })
        }}
      />
      {tagTypes.map(type => (
        <TagCell
          key={type}
          type={type}
          tags={tags.filter(t => t.type === type)}
          tagInstances={tagInstancesByType[type] || []}
          datetime={slotStart.toISOString()}
          onCreateTag={onCreateTag}
          onCreateTagInstance={onCreateTagInstance}
          onDeleteTagInstance={onDeleteTagInstance}
        />
      ))}
    </div>
  )
}

export default TimeBlockRow

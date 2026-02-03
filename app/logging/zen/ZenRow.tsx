'use client'
import NotesInput from '../editor/NotesInput'
import TagCell from '../tags/TagCell'
import type { TagInstance, Timeblock } from '../types'

const ZenRow = ({ timeblock, timeLabel, ensureTimeblock, onPatchTimeblockDebounced, minHeight, datetime, tagTypes, tagInstancesByType, allTagInstances, onCreateTagInstance, onApproveTagInstance, onPatchTagInstance, onDeleteTagInstance }:{
  timeblock?: Timeblock,
  timeLabel: string,
  ensureTimeblock: () => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, debounceMs?: number }) => void,
  minHeight?: number | string,
  datetime: string,
  tagTypes: string[],
  tagInstancesByType: Record<string, TagInstance[]>,
  allTagInstances: TagInstance[],
  onCreateTagInstance: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onApproveTagInstance: (args: { id: number }) => Promise<void> | void,
  onPatchTagInstance: (args: { id: number, useful?: boolean, antiUseful?: boolean }) => Promise<void> | void,
  onDeleteTagInstance: (args: { id: number }) => Promise<void> | void,
}) => {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-1">
        {tagTypes.map(type => (
          <div key={type} className="flex-1 basis-0">
            <TagCell
              type={type}
              tagInstances={tagInstancesByType[type] || []}
              allTagInstances={allTagInstances}
              datetime={datetime}
              onCreateTagInstance={onCreateTagInstance}
              onApproveTagInstance={onApproveTagInstance}
              onPatchTagInstance={onPatchTagInstance}
              onDeleteTagInstance={onDeleteTagInstance}
            />
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mb-1">{timeLabel}</div>
      <NotesInput
        noteKey={timeblock ? `${timeblock.id}:rayNotes` : undefined}
        placeholder=""
        initialValue={timeblock?.rayNotes || ''}
        externalValue={timeblock?.rayNotes || ''}
        minHeight={minHeight}
        onSave={async (content) => {
          const tb = await ensureTimeblock()
          onPatchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 300 })
        }}
      />
    </div>
  )
}

export default ZenRow

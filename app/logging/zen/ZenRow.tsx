'use client'
import NotesInput from '../editor/NotesInput'
import type { Timeblock } from '../types'

const ZenRow = ({ timeblock, timeLabel, ensureTimeblock, onPatchTimeblockDebounced, minHeight }:{
  timeblock?: Timeblock,
  timeLabel: string,
  ensureTimeblock: () => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, assistantNotes?: string | null, aiNotes?: string | null, debounceMs?: number }) => void,
  minHeight?: number | string,
}) => {
  return (
    <div style={{ width: 720 }} className="mt-4">
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

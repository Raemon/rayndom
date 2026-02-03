'use client'
import NotesInput from '../editor/NotesInput'
import RunAIButton from './RunAIButton'
import MarkdownContent from '../../common/MarkdownContent'
import Checklist from '../checklist/Checklist'
import type { Timeblock } from '../types'

const ZenRow = ({ timeblock, timeLabel, ensureTimeblock, onPatchTimeblockDebounced, onAIComplete, minHeight }:{
  timeblock?: Timeblock,
  timeLabel: string,
  ensureTimeblock: () => Promise<Timeblock>,
  onPatchTimeblockDebounced: (args: { id: number, rayNotes?: string | null, aiNotes?: string | null, debounceMs?: number }) => void,
  onAIComplete?: () => void,
  minHeight?: number | string,
}) => {
  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <div className="text-xs text-gray-500 p-2">
        {timeLabel}
      </div>
      <div className="flex gap-4 flex-1" style={{overflow: 'hidden'}}>
        <div style={{flex: 1, overflow: 'auto'}}>
          <RunAIButton ensureTimeblock={ensureTimeblock} onComplete={onAIComplete} />
          <MarkdownContent html={timeblock?.aiNotes || ''} />
        </div>
        <div style={{flex: 1, overflow: 'auto'}}>
          <NotesInput
            noteKey={timeblock ? `${timeblock.id}:rayNotes` : undefined}
            placeholder="Notes"
            initialValue={timeblock?.rayNotes || ''}
            externalValue={timeblock?.rayNotes || ''}
            minHeight={minHeight}
            expandable={false}
            onSave={async (content) => {
              const tb = await ensureTimeblock()
              onPatchTimeblockDebounced({ id: tb.id, rayNotes: content, debounceMs: 300 })
            }}
          />
        </div>
        <div style={{flex: 1, overflow: 'auto'}}>
          <Checklist inline />
        </div>
      </div>
    </div>
  )
}

export default ZenRow

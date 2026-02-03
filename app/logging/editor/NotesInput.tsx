'use client'
import SmartEditor from './SmartEditor'
import type { TagInstance } from '../types'

type TagInstanceCallbacks = {
  datetime?: string,
  onCreateTagInstance?: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onDeleteTagInstance?: (args: { id: number }) => Promise<void> | void,
}

const NotesInput = ({ noteKey, initialValue, externalValue, placeholder, onSave, minHeight=25, noExpand=false, expandable=true, datetime, onCreateTagInstance, onDeleteTagInstance }:{ noteKey?: string, initialValue: string, externalValue?: string, placeholder: string, onSave?: (content: string) => void, minHeight?: number | string, noExpand?: boolean, expandable?: boolean } & TagInstanceCallbacks) => {
  return <SmartEditor noteKey={noteKey} initialValue={initialValue} externalValue={externalValue} placeholder={placeholder} onSave={onSave} minHeight={minHeight} noExpand={noExpand} expandable={expandable} datetime={datetime} onCreateTagInstance={onCreateTagInstance} onDeleteTagInstance={onDeleteTagInstance} />
}

export default NotesInput

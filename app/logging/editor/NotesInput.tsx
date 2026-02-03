'use client'
import SmartEditor from './SmartEditor'

const NotesInput = ({ noteKey, initialValue, externalValue, placeholder, onSave, minHeight=25, noExpand=false, expandable=true }:{ noteKey?: string, initialValue: string, externalValue?: string, placeholder: string, onSave?: (content: string) => void, minHeight?: number | string, noExpand?: boolean, expandable?: boolean }) => {
  return <SmartEditor noteKey={noteKey} initialValue={initialValue} externalValue={externalValue} placeholder={placeholder} onSave={onSave} minHeight={minHeight} noExpand={noExpand} expandable={expandable} />
}

export default NotesInput

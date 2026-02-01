'use client'
import SmartEditor from './SmartEditor'

const NotesInput = ({ noteKey, initialValue, externalValue, placeholder, onSave, minHeight=25, noExpand=false }:{ noteKey?: string, initialValue: string, externalValue?: string, placeholder: string, onSave?: (content: string) => void, minHeight?: number, noExpand?: boolean }) => {
  return <SmartEditor noteKey={noteKey} initialValue={initialValue} externalValue={externalValue} placeholder={placeholder} onSave={onSave} minHeight={minHeight} noExpand={noExpand} />
}

export default NotesInput

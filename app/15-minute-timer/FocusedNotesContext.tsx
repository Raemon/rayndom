'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type FocusedNotesContextType = {
  focusedNoteKeys: Set<string>
  registerFocus: (key: string) => void
  unregisterFocus: (key: string) => void
  isFocused: (key: string) => boolean
}

const FocusedNotesContext = createContext<FocusedNotesContextType | null>(null)

export const FocusedNotesProvider = ({ children }:{ children: ReactNode }) => {
  const [focusedNoteKeys, setFocusedNoteKeys] = useState<Set<string>>(new Set())
  const registerFocus = useCallback((key: string) => {
    setFocusedNoteKeys(prev => new Set([...prev, key]))
  }, [])
  const unregisterFocus = useCallback((key: string) => {
    setFocusedNoteKeys(prev => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])
  const isFocused = useCallback((key: string) => focusedNoteKeys.has(key), [focusedNoteKeys])
  return (
    <FocusedNotesContext.Provider value={{ focusedNoteKeys, registerFocus, unregisterFocus, isFocused }}>
      {children}
    </FocusedNotesContext.Provider>
  )
}

export const useFocusedNotes = () => {
  const ctx = useContext(FocusedNotesContext)
  if (!ctx) throw new Error('useFocusedNotes must be used within FocusedNotesProvider')
  return ctx
}

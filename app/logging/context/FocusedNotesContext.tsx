'use client'
import { createContext, useContext, useRef, useCallback, useMemo, ReactNode } from 'react'

type FocusedNotesContextType = {
  focusedNoteKeysRef: React.RefObject<Set<string>>
  registerFocus: (key: string) => void
  unregisterFocus: (key: string) => void
}

const FocusedNotesContext = createContext<FocusedNotesContextType | null>(null)

export const FocusedNotesProvider = ({ children }:{ children: ReactNode }) => {
  const focusedNoteKeysRef = useRef<Set<string>>(new Set())
  const registerFocus = useCallback((key: string) => {
    focusedNoteKeysRef.current = new Set([...focusedNoteKeysRef.current, key])
  }, [])
  const unregisterFocus = useCallback((key: string) => {
    const next = new Set(focusedNoteKeysRef.current)
    next.delete(key)
    focusedNoteKeysRef.current = next
  }, [])
  const value = useMemo(() => ({ focusedNoteKeysRef, registerFocus, unregisterFocus }), [registerFocus, unregisterFocus])
  return (
    <FocusedNotesContext.Provider value={value}>
      {children}
    </FocusedNotesContext.Provider>
  )
}

export const useFocusedNotes = () => {
  const ctx = useContext(FocusedNotesContext)
  if (!ctx) throw new Error('useFocusedNotes must be used within FocusedNotesProvider')
  return ctx
}

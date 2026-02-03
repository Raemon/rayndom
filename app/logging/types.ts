export type Timeblock = { id: number, rayNotes: string | null, assistantNotes: string | null, aiNotes: string | null, datetime: string }

export type Tag = { id: number, name: string, type: string, parentTagId?: number | null, parentTag?: Tag | null, suggestedTagIds?: number[] | null }

export type TagInstance = { id: number, tagId: number, datetime: string, llmPredicted: boolean, approved: boolean, llmReason?: string | null, useful?: boolean, antiUseful?: boolean, tag?: Tag }

export type Command = { id: number, name: string, html: string }

export type TimerAllData = { timeblocks: Timeblock[], tags: Tag[], tagInstances: TagInstance[] }

export type SectionKey = 'morning' | 'afternoon' | 'evening' | 'night'

export type ChecklistItem = { id: number; title: string; completed: boolean; sortOrder: number; orientingBlock: boolean; section: string | null }

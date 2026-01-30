export type Timeblock = { id: number, rayNotes: string | null, assistantNotes: string | null, aiNotes: string | null, datetime: string }

export type Tag = { id: number, name: string, type: string, parentTagId?: number | null, parentTag?: Tag | null, suggestedTagIds?: number[] | null }

export type TagInstance = { id: number, tagId: number, datetime: string, llmPredicted: boolean, approved: boolean, llmReason?: string | null, tag?: Tag }

export type TimerAllData = { timeblocks: Timeblock[], tags: Tag[], tagInstances: TagInstance[] }

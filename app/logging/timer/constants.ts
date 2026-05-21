import type { TagInstance, Timeblock } from '../types'

// Shared stable empty arrays so memoized section components don't see a fresh [] each render.
export const EMPTY_TIMEBLOCKS: Timeblock[] = []
export const EMPTY_TAG_INSTANCES: TagInstance[] = []

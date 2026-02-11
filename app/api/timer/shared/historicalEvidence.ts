import type { ScreenshotEvidenceEntry } from './screenshotEvidence'
import { addDays, fetchScreenshotEvidenceForDate, getDateString, getEntriesInRange } from './screenshotEvidence'

export type TimeblockEvidence = {
  datetime: string
  durationMinutes: number
  screenshotEvidence: ScreenshotEvidenceEntry[]
  screenshotSummaryText: string
}

export type ApprovedLabel = { tagId: number, tagName: string, tagType: string }

export type LabeledTimeblockEvidence = TimeblockEvidence & { approvedLabels: ApprovedLabel[] }

const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

export const buildScreenshotBackedEvidenceForTimeblocks = (
  { timeblocks, screenshotEntriesByDate }:
  { timeblocks: { datetime: Date | string, duration?: number | null }[], screenshotEntriesByDate: Record<string, ScreenshotEvidenceEntry[]> }
): TimeblockEvidence[] => {
  const evidence: TimeblockEvidence[] = []
  for (const tb of timeblocks) {
    const datetime = typeof tb.datetime === 'string' ? new Date(tb.datetime) : tb.datetime
    const durationMinutes = tb.duration ? tb.duration : 15
    const start = floorTo15(datetime)
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
    const dateStr = getDateString(start)
    const entriesForDate = screenshotEntriesByDate[dateStr] || []
    const windowEntries = getEntriesInRange(entriesForDate, start, end)
    if (windowEntries.length === 0) continue
    const screenshotSummaryText = windowEntries.map(e => `[${e.timestamp}] ${e.summary}`).join('\n')
    evidence.push({ datetime: start.toISOString(), durationMinutes, screenshotEvidence: windowEntries, screenshotSummaryText })
  }
  return evidence
}

export const attachApprovedLabelsToEvidence = (
  { evidence, approvedTagInstances }:
  { evidence: TimeblockEvidence[], approvedTagInstances: { datetime: Date | string, tagId: number, tag?: { name: string, type: string } | null }[] }
): LabeledTimeblockEvidence[] => {
  const slotToLabels = new Map<string, ApprovedLabel[]>()
  const approvedInstances = approvedTagInstances
  for (const ti of approvedInstances) {
    const dt = typeof ti.datetime === 'string' ? new Date(ti.datetime) : ti.datetime
    const slot = floorTo15(dt).toISOString()
    const label: ApprovedLabel = { tagId: ti.tagId, tagName: ti.tag?.name || String(ti.tagId), tagType: ti.tag?.type || '' }
    const existing = slotToLabels.get(slot) || []
    existing.push(label)
    slotToLabels.set(slot, existing)
  }
  const labeled: LabeledTimeblockEvidence[] = []
  const evidenceBlocks = evidence
  for (const block of evidenceBlocks) {
    labeled.push({ ...block, approvedLabels: slotToLabels.get(block.datetime) || [] })
  }
  return labeled
}

export const fetchScreenshotEvidenceForDateRange = async (args: { startDate: Date, endDateExclusive: Date }) => {
  const dateToEntries: Record<string, ScreenshotEvidenceEntry[]> = {}
  const dateToRaw: Record<string, string> = {}
  const dateToError: Record<string, string> = {}
  const dateStringsToFetch: string[] = []
  for (let d = new Date(args.startDate); d < args.endDateExclusive; d = addDays(d, 1)) {
    dateStringsToFetch.push(getDateString(d))
  }
  for (const dateStr of dateStringsToFetch) {
    const result = await fetchScreenshotEvidenceForDate(dateStr)
    if ('error' in result) {
      dateToError[dateStr] = result.error
      continue
    }
    dateToRaw[dateStr] = result.rawText
    dateToEntries[dateStr] = result.entries
  }
  return { dateToEntries, dateToRaw, dateToError }
}


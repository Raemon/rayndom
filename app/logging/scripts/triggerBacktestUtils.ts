import { prisma } from '../../../lib/prisma'
import { attachApprovedLabelsToEvidence, buildScreenshotBackedEvidenceForTimeblocks, fetchScreenshotEvidenceForDateRange } from '../../api/timer/shared/historicalEvidence'

export const loadLabeledTriggerEvidence = async (args: { start: Date, endExclusive: Date }) => {
  const triggerTags = await prisma.tag.findMany({ where: { type: 'Triggers' }, orderBy: [{ name: 'asc' }] })
  const timeblocks = await prisma.timeblock.findMany({ where: { datetime: { gte: args.start, lt: args.endExclusive } }, orderBy: [{ datetime: 'asc' }] })
  const approvedTriggerInstances = await prisma.tagInstance.findMany({
    where: { approved: true, datetime: { gte: args.start, lt: args.endExclusive }, tag: { type: 'Triggers' } },
    include: { tag: true },
    orderBy: [{ datetime: 'asc' }]
  })
  const screenshots = await fetchScreenshotEvidenceForDateRange({ startDate: args.start, endDateExclusive: args.endExclusive })
  const evidence = buildScreenshotBackedEvidenceForTimeblocks({ timeblocks, screenshotEntriesByDate: screenshots.dateToEntries })
  const labeledEvidence = attachApprovedLabelsToEvidence({ evidence, approvedTagInstances: approvedTriggerInstances })
  return { labeledEvidence, triggerTags, screenshotFetchErrors: screenshots.dateToError }
}


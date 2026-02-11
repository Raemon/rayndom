import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { loadLabeledTriggerEvidence } from './triggerBacktestUtils'
import { attachApprovedLabelsToEvidence, buildScreenshotBackedEvidenceForTimeblocks, fetchScreenshotEvidenceForDateRange } from '../../api/timer/shared/historicalEvidence'
import { buildTriggerRuleSet, decideTriggerTag } from '../../api/timer/shared/triggerRules'

const parseDateArg = (s: string) => {
  const d = new Date(s)
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${s}`)
  return d
}

const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)

type AirtableRecord = { fields?: Record<string, unknown> }

const hashStringToPositiveInt = (s: string) => {
  let h = 2166136261
  for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) }
  return Math.abs(h)
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string')

const loadAirtableLabeledTriggerEvidence = async (args: { start: Date, endExclusive: Date }) => {
  const jsonPath = path.join(process.cwd(), 'airtable_data.json')
  const raw = fs.readFileSync(jsonPath, 'utf-8')
  const records: AirtableRecord[] = JSON.parse(raw)
  const timeblocks: { datetime: Date, duration: number }[] = []
  const approvedTagInstances: { datetime: Date, tagId: number, tag: { name: string, type: string } }[] = []
  const triggerNameSet = new Set<string>()
  const airtableRecords = records
  for (const record of airtableRecords) {
    const fields = record.fields || {}
    const dtRaw = fields['Datetime']
    if (typeof dtRaw !== 'string') continue
    const dt = new Date(dtRaw)
    if (isNaN(dt.getTime())) continue
    const slot = floorTo15(dt)
    if (slot < args.start || slot >= args.endExclusive) continue
    timeblocks.push({ datetime: slot, duration: 15 })
    const triggerField = fields['???']
    const triggerNames: string[] = isStringArray(triggerField) ? triggerField : (typeof triggerField === 'string' ? [triggerField] : [])
    for (const triggerNameRaw of triggerNames) {
      const triggerName = triggerNameRaw.trim()
      if (!triggerName) continue
      triggerNameSet.add(triggerName)
      const tagId = hashStringToPositiveInt(`Triggers:${triggerName}`)
      approvedTagInstances.push({ datetime: slot, tagId, tag: { name: triggerName, type: 'Triggers' } })
    }
  }
  const triggerTags = Array.from(triggerNameSet).sort().map(name => ({ id: hashStringToPositiveInt(`Triggers:${name}`), name }))
  const screenshots = await fetchScreenshotEvidenceForDateRange({ startDate: args.start, endDateExclusive: args.endExclusive })
  const evidence = buildScreenshotBackedEvidenceForTimeblocks({ timeblocks, screenshotEntriesByDate: screenshots.dateToEntries })
  const labeledEvidence = attachApprovedLabelsToEvidence({ evidence, approvedTagInstances })
  return { labeledEvidence, triggerTags, screenshotFetchErrors: screenshots.dateToError, source: 'airtable_data.json' as const }
}

const getTruthByTagId = (labeledEvidence: { datetime: string, approvedLabels: { tagId: number }[] }[]) => {
  const truth = new Map<number, Set<string>>()
  const blocks = labeledEvidence
  for (const block of blocks) {
    for (const label of block.approvedLabels) {
      if (!truth.has(label.tagId)) truth.set(label.tagId, new Set<string>())
      truth.get(label.tagId)!.add(block.datetime)
    }
  }
  return truth
}

const main = async () => {
  const startArg = process.argv[2]
  const endArg = process.argv[3]
  if (!startArg || !endArg) {
    console.log('Usage: npx tsx app/logging/scripts/backtest_trigger_rules.ts <startISO> <endISOExclusive>')
    process.exit(1)
  }
  const start = parseDateArg(startArg)
  const endExclusive = parseDateArg(endArg)
  let labeledEvidence: { datetime: string, screenshotSummaryText: string, approvedLabels: { tagId: number, tagName: string }[] }[] = []
  let triggerTags: { id: number, name: string }[] = []
  let screenshotFetchErrors: Record<string, string> = {}
  let source: string = 'db'
  try {
    const result = await loadLabeledTriggerEvidence({ start, endExclusive })
    labeledEvidence = result.labeledEvidence
    triggerTags = result.triggerTags.map(t => ({ id: t.id, name: t.name }))
    screenshotFetchErrors = result.screenshotFetchErrors
  } catch (e) {
    const fallback = await loadAirtableLabeledTriggerEvidence({ start, endExclusive })
    labeledEvidence = fallback.labeledEvidence
    triggerTags = fallback.triggerTags
    screenshotFetchErrors = fallback.screenshotFetchErrors
    source = fallback.source
  }
  const screenshotBackedBlocks = labeledEvidence
  console.log(JSON.stringify({ source, start: start.toISOString(), endExclusive: endExclusive.toISOString(), screenshotBackedBlocks: screenshotBackedBlocks.length, triggerTagCount: triggerTags.length, screenshotFetchErrorDates: Object.keys(screenshotFetchErrors).length }))
  const ruleMap = buildTriggerRuleSet({ triggerTags })
  const truth = getTruthByTagId(screenshotBackedBlocks)
  const tagIdToName = new Map<number, string>()
  for (const t of triggerTags) tagIdToName.set(t.id, t.name)
  const metrics: { tagId: number, name: string, tp: number, fp: number, fn: number, precision: number, recall: number, f1: number, highPositives: number, lowPositives: number, unknownCount: number }[] = []
  const tagsToScore = triggerTags
  for (const tag of tagsToScore) {
    const truthSlots = truth.get(tag.id) || new Set<string>()
    let tp = 0
    let fp = 0
    let fn = 0
    let highPositives = 0
    let lowPositives = 0
    let unknownCount = 0
    for (const block of screenshotBackedBlocks) {
      const decision = decideTriggerTag({ ruleMap, tagId: tag.id, evidence: block as any })
      const isTrue = truthSlots.has(block.datetime)
      if (decision.confidence === 'unknown') unknownCount += 1
      if (decision.applies && decision.confidence === 'high') highPositives += 1
      if (decision.applies && decision.confidence === 'low') lowPositives += 1
      const predictedPositive = decision.applies && decision.confidence === 'high'
      if (predictedPositive && isTrue) tp += 1
      if (predictedPositive && !isTrue) fp += 1
      if (!predictedPositive && isTrue) fn += 1
    }
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp)
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn)
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
    metrics.push({ tagId: tag.id, name: tag.name, tp, fp, fn, precision, recall, f1, highPositives, lowPositives, unknownCount })
  }
  metrics.sort((a, b) => (b.f1 - a.f1) || (b.recall - a.recall) || (b.precision - a.precision))
  console.log('\nTop 25 by F1 (high-confidence predictions only):')
  for (const row of metrics.slice(0, 25)) {
    console.log(`${row.name}\tF1=${row.f1.toFixed(2)}\tP=${row.precision.toFixed(2)}\tR=${row.recall.toFixed(2)}\tTP=${row.tp}\tFP=${row.fp}\tFN=${row.fn}\thigh+=${row.highPositives}\tlow+=${row.lowPositives}\tunknown=${row.unknownCount}`)
  }
  console.log('\nBottom 25 by F1 (high-confidence predictions only):')
  const worst = [...metrics].sort((a, b) => (a.f1 - b.f1) || (a.recall - b.recall) || (a.precision - b.precision))
  for (const row of worst.slice(0, 25)) {
    console.log(`${row.name}\tF1=${row.f1.toFixed(2)}\tP=${row.precision.toFixed(2)}\tR=${row.recall.toFixed(2)}\tTP=${row.tp}\tFP=${row.fp}\tFN=${row.fn}\thigh+=${row.highPositives}\tlow+=${row.lowPositives}\tunknown=${row.unknownCount}`)
  }
  const targets = worst.slice(0, 6).map(r => r.tagId)
  console.log('\nFP/FN examples (worst 6 tags):')
  for (const tagId of targets) {
    const tagName = tagIdToName.get(tagId) || String(tagId)
    const rule = ruleMap.get(tagId)
    if (!rule) continue
    const truthSlots = truth.get(tagId) || new Set<string>()
    const fps: { datetime: string, summary: string, trueTags: string[] }[] = []
    const fns: { datetime: string, summary: string, trueTags: string[] }[] = []
    for (const block of screenshotBackedBlocks) {
      const decision = rule(block as any)
      const isTrue = truthSlots.has(block.datetime)
      const predictedPositive = decision.applies && decision.confidence === 'high'
      if (predictedPositive && !isTrue && fps.length < 3) fps.push({ datetime: block.datetime, summary: block.screenshotSummaryText.split('\n').slice(0, 3).join('\n'), trueTags: block.approvedLabels.map(l => l.tagName) })
      if (!predictedPositive && isTrue && fns.length < 3) fns.push({ datetime: block.datetime, summary: block.screenshotSummaryText.split('\n').slice(0, 3).join('\n'), trueTags: block.approvedLabels.map(l => l.tagName) })
      if (fps.length >= 3 && fns.length >= 3) break
    }
    console.log(`\nTag: ${tagName}`)
    if (fps.length === 0) console.log('  FP: (none sampled)')
    for (const ex of fps) {
      console.log(`  FP @ ${ex.datetime} (true=${ex.trueTags.join(', ')})\n${ex.summary}\n`)
    }
    if (fns.length === 0) console.log('  FN: (none sampled)')
    for (const ex of fns) {
      console.log(`  FN @ ${ex.datetime} (true=${ex.trueTags.join(', ')})\n${ex.summary}\n`)
    }
  }
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


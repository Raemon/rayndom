import type { ScreenshotEvidenceEntry } from './screenshotEvidence'
import type { TimeblockEvidence } from './historicalEvidence'

export type TriggerRuleConfidence = 'high' | 'low' | 'unknown'
export type TriggerRuleDecision = { applies: boolean, confidence: TriggerRuleConfidence, reason: string }
export type TriggerRuleFn = (evidence: TimeblockEvidence) => TriggerRuleDecision

const normalize = (s: string) => s.toLowerCase()
const includesAny = (haystack: string, needles: string[]) => {
  const h = normalize(haystack)
  const needleStrings = needles
  for (const needle of needleStrings) {
    if (h.includes(normalize(needle))) return true
  }
  return false
}

const getAllWindows = (screenshotEvidence: ScreenshotEvidenceEntry[]) => {
  const windows: { applicationName?: string, title?: string, url?: string, exactText?: string }[] = []
  const entries = screenshotEvidence
  for (const entry of entries) {
    for (const w of entry.windows) windows.push(w)
  }
  return windows
}

const getTextForWindows = (windows: { applicationName?: string, title?: string, url?: string, exactText?: string }[]) => {
  const parts: string[] = []
  const windowsToScan = windows
  for (const w of windowsToScan) {
    if (w.applicationName) parts.push(w.applicationName)
    if (w.title) parts.push(w.title)
    if (w.url) parts.push(w.url)
    if (w.exactText) parts.push(w.exactText)
  }
  return parts.join('\n')
}

const getEvidenceText = (screenshotEvidence: ScreenshotEvidenceEntry[]) => {
  const parts: string[] = []
  const entries = screenshotEvidence
  for (const entry of entries) {
    parts.push(entry.summary || '')
    for (const w of entry.windows) {
      if (w.applicationName) parts.push(w.applicationName)
      if (w.title) parts.push(w.title)
      if (w.url) parts.push(w.url)
      if (w.exactText) parts.push(w.exactText)
    }
  }
  return parts.join('\n')
}

const unknownRule = (tagName: string): TriggerRuleFn => () => ({ applies: false, confidence: 'unknown', reason: `No deterministic rule for "${tagName}" (insufficient screenshot-only signal)` })

const rulePRReview: TriggerRuleFn = (evidence) => {
  const windows = getAllWindows(evidence.screenshotEvidence)
  const urlsText = windows.map(w => w.url || '').join('\n')
  const titleText = windows.map(w => w.title || '').join('\n')
  if (includesAny(urlsText, ['/issues/'])) return { applies: false, confidence: 'high', reason: 'GitHub Issues anti-signal present' }
  if (includesAny(urlsText, ['github.com']) && includesAny(urlsText, ['/pull/'])) return { applies: true, confidence: 'high', reason: 'Detected GitHub PR URL (/pull/)' }
  if (includesAny(titleText, ['pull request', 'files changed'])) return { applies: true, confidence: 'low', reason: 'Detected PR-ish keywords in title text without URL confirmation' }
  return { applies: false, confidence: 'high', reason: 'No PR URL or PR keywords detected' }
}

const ruleSwitchToBrowserInspector: TriggerRuleFn = (evidence) => {
  const windows = getAllWindows(evidence.screenshotEvidence)
  const chromeWindows = windows.filter(w => includesAny(w.applicationName || '', ['google chrome', 'chrome']))
  if (chromeWindows.length === 0) return { applies: false, confidence: 'high', reason: 'No Chrome window visible' }
  const chromeText = getTextForWindows(chromeWindows)
  const hasInspectorTabs = includesAny(chromeText, ['elements', 'styles', 'computed', 'network', 'console'])
  const hasDevtoolsMarker = includesAny(chromeText, ['devtools', 'developer tools'])
  if (hasInspectorTabs && hasDevtoolsMarker) return { applies: true, confidence: 'high', reason: 'Chrome window shows DevTools marker + inspector tab keywords' }
  if (hasInspectorTabs) return { applies: true, confidence: 'low', reason: 'Chrome window shows inspector tab keywords (DevTools marker not found)' }
  return { applies: false, confidence: 'high', reason: 'No DevTools/Inspector keywords found within Chrome windows' }
}

const ruleDebuggingCSS: TriggerRuleFn = (evidence) => {
  const windows = getAllWindows(evidence.screenshotEvidence)
  const chromeWindows = windows.filter(w => includesAny(w.applicationName || '', ['google chrome', 'chrome']))
  const chromeText = getTextForWindows(chromeWindows)
  const hasCssSignals = includesAny(chromeText, ['css', 'stylesheet', 'flex', 'grid', 'tailwind', 'class='])
  const hasDevtoolsSignals = includesAny(chromeText, ['devtools', 'developer tools', 'elements', 'styles', 'computed', 'inspect'])
  const has3dSignals = includesAny(chromeText, ['three.js', 'webgl', 'shader', 'camera', 'lighting', 'z-fighting'])
  if (has3dSignals) return { applies: false, confidence: 'high', reason: '3D rendering anti-signal present (likely Debug 3D Visuals, not CSS)' }
  if (hasCssSignals && hasDevtoolsSignals) return { applies: true, confidence: 'high', reason: 'CSS + DevTools/Inspector signals present' }
  if (hasCssSignals) return { applies: true, confidence: 'low', reason: 'CSS-related keywords present but DevTools not clearly visible' }
  return { applies: false, confidence: 'high', reason: 'No CSS debugging signals detected' }
}

const ruleDebug3DVisuals: TriggerRuleFn = (evidence) => {
  const windows = getAllWindows(evidence.screenshotEvidence)
  const text = getTextForWindows(windows)
  const has3dSignals = includesAny(text, ['three.js', 'webgl', 'shader', 'camera', 'lighting', 'z-fighting', 'renderer'])
  const hasCssSignals = includesAny(text, ['css', 'stylesheet', 'tailwind', 'flex', 'grid'])
  if (hasCssSignals && !has3dSignals) return { applies: false, confidence: 'high', reason: 'CSS anti-signal present without 3D signals' }
  if (has3dSignals) return { applies: true, confidence: 'low', reason: '3D rendering keywords present' }
  return { applies: false, confidence: 'high', reason: 'No 3D rendering keywords detected' }
}

const ruleCheckingSlack: TriggerRuleFn = (evidence) => {
  const windows = getAllWindows(evidence.screenshotEvidence)
  const slackWindows = windows.filter(w => includesAny(w.applicationName || '', ['slack']) || includesAny(w.title || '', ['slack']))
  const slackText = getTextForWindows(slackWindows)
  const hasSlack = slackWindows.length > 0
  const hasTypingSignals = includesAny(slackText, ['write a message', 'send', 'message'])
  if (!hasSlack) return { applies: false, confidence: 'high', reason: 'Slack not visible' }
  if (hasTypingSignals) return { applies: false, confidence: 'low', reason: 'Typing/compose anti-signal present (might be DMing)' }
  return { applies: true, confidence: 'low', reason: 'Slack visible without obvious compose/typing signals' }
}

const ruleDMing: TriggerRuleFn = (evidence) => {
  const windows = getAllWindows(evidence.screenshotEvidence)
  const messagingWindows = windows.filter(w => includesAny(w.applicationName || '', ['slack', 'messages', 'messenger', 'discord', 'signal']) || includesAny(w.title || '', ['messages', 'messenger', 'discord']))
  const messagingText = getTextForWindows(messagingWindows)
  const hasMessagingApp = messagingWindows.length > 0
  const hasComposeSignals = includesAny(messagingText, ['write a message', 'send', 'new message', 'dm'])
  if (!hasMessagingApp) return { applies: false, confidence: 'high', reason: 'No messaging app visible' }
  if (hasComposeSignals) return { applies: true, confidence: 'low', reason: 'Messaging app visible with compose/send signals' }
  return { applies: false, confidence: 'low', reason: 'Messaging app visible but compose/send not detected' }
}

export const buildTriggerRuleSet = (args: { triggerTags: { id: number, name: string }[] }) => {
  const ruleMap = new Map<number, TriggerRuleFn>()
  const allTriggerTags = args.triggerTags
  for (const tag of allTriggerTags) {
    const tagName = tag.name
    if (tagName === 'PR Review') { ruleMap.set(tag.id, rulePRReview); continue }
    if (tagName === 'Switch to Browser Inspector') { ruleMap.set(tag.id, ruleSwitchToBrowserInspector); continue }
    if (tagName === 'Debugging CSS') { ruleMap.set(tag.id, ruleDebuggingCSS); continue }
    if (tagName === 'Debug 3D Visuals') { ruleMap.set(tag.id, ruleDebug3DVisuals); continue }
    if (tagName === 'Checking Slack') { ruleMap.set(tag.id, ruleCheckingSlack); continue }
    if (tagName === 'DMing') { ruleMap.set(tag.id, ruleDMing); continue }
    ruleMap.set(tag.id, unknownRule(tagName))
  }
  return ruleMap
}

export const decideTriggerTag = (args: { ruleMap: Map<number, TriggerRuleFn>, tagId: number, evidence: TimeblockEvidence }) => {
  const rule = args.ruleMap.get(args.tagId)
  if (!rule) return { applies: false, confidence: 'unknown' as const, reason: `No rule found for tagId=${args.tagId}` }
  return rule(args.evidence)
}


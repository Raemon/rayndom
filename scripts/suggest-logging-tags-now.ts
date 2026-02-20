import 'dotenv/config'
import { prisma } from '../lib/prisma'

const SCREENPIPE_URL = process.env.SCREENPIPE_URL || 'http://127.0.0.1:3030'
const LIMIT = Number(process.env.SUGGEST_TAGS_LIMIT || 120)
const MIN_SCORE = Number(process.env.SUGGEST_TAGS_MIN_SCORE || 0.55)
const MAX_FRAMES_FOR_CORPUS = Number(process.env.SUGGEST_TAGS_MAX_FRAMES || 40)
const MAX_WINDOWS_TO_PRINT = Number(process.env.SUGGEST_TAGS_MAX_WINDOWS || 12)
const MAX_TAGS_PER_TYPE = Number(process.env.SUGGEST_TAGS_MAX_PER_TYPE || 8)

type ScreenpipeSearchItem = {
  content?: {
    timestamp?: string
    app_name?: string
    window_name?: string
    text?: string
  }
}

const stopWords = new Set([
  'the','and','for','with','from','that','this','you','your','are','was','have','has','not','all','too','but','can','just','into','out','about','what','when','where','how','why','did','does','done','more','less','like','work','working','today','yesterday','channel','messages','message','file','files','window'
])

const normalize = ({ value }:{ value: string | null | undefined }) => {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

const scoreTagAgainstCorpus = ({ tagName, corpus }:{ tagName: string, corpus: string }) => {
  const tagTokens = normalize({ value: tagName }).split(' ').filter(token => token.length >= 3 && !stopWords.has(token))
  if (!tagTokens.length) return 0
  let hitCount = 0
  for (const tagToken of tagTokens) {
    if (corpus.includes(tagToken)) hitCount++
  }
  return hitCount / tagTokens.length
}

const fetchRecentOcrFrames = async () => {
  const response = await fetch(`${SCREENPIPE_URL}/search?limit=${LIMIT}&content_type=ocr&offset=0`)
  if (!response.ok) throw new Error(`Screenpipe request failed: ${response.status}`)
  const data = await response.json() as { data?: ScreenpipeSearchItem[] }
  const rawItems = data.data || []
  const contentItems = rawItems.map(item => item.content).filter((item): item is NonNullable<ScreenpipeSearchItem['content']> => !!item)
  return contentItems.sort((left, right) => {
    const leftTimestamp = left.timestamp ? new Date(left.timestamp).getTime() : 0
    const rightTimestamp = right.timestamp ? new Date(right.timestamp).getTime() : 0
    return rightTimestamp - leftTimestamp
  })
}

const main = async () => {
  const allTags = await prisma.tag.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] })
  const recentFrames = await fetchRecentOcrFrames()
  const recentFramesForCorpus = recentFrames.slice(0, MAX_FRAMES_FOR_CORPUS)
  const corpusText = recentFramesForCorpus.map(frame => [frame.app_name || '', frame.window_name || '', frame.text || ''].join(' ')).join(' ')
  const normalizedCorpus = normalize({ value: corpusText })

  const scoredTags = allTags.map(tag => {
    return {
      id: tag.id,
      name: tag.name,
      type: tag.type,
      score: scoreTagAgainstCorpus({ tagName: tag.name, corpus: normalizedCorpus })
    }
  }).filter(tag => tag.score >= MIN_SCORE).sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))

  const windowLines = recentFrames.slice(0, MAX_WINDOWS_TO_PRINT).map(frame => `${frame.timestamp || 'no-timestamp'} | ${frame.app_name || 'unknown-app'} | ${frame.window_name || 'unknown-window'}`)
  const tagTypes = ['Projects', 'Triggers', 'Techniques']

  console.log(`Screenpipe: ${SCREENPIPE_URL}`)
  console.log(`Frames fetched: ${recentFrames.length} (limit=${LIMIT})`)
  console.log(`Scoring: min_score=${MIN_SCORE}, corpus_frames=${MAX_FRAMES_FOR_CORPUS}`)
  console.log('')
  console.log('Recent windows:')
  for (const windowLine of windowLines) console.log(`- ${windowLine}`)
  console.log('')
  console.log('Suggested tags:')
  for (const tagType of tagTypes) {
    const tagsForType = scoredTags.filter(tag => tag.type === tagType).slice(0, MAX_TAGS_PER_TYPE)
    console.log('')
    console.log(`[${tagType}]`)
    if (!tagsForType.length) {
      console.log('- none')
      continue
    }
    for (const suggestedTag of tagsForType) console.log(`- ${suggestedTag.name} (${suggestedTag.score.toFixed(2)})`)
  }
}

main().catch((error) => {
  console.error('[suggest-logging-tags-now] Failed:', error)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})

import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { JSDOM } from 'jsdom'
import { StoryCard } from '@/app/observatory/hackerNewsTypes'
import { observatoryPrisma } from '@/lib/observatoryPrisma'
import { extractStoryContent, extractStoryContentHtml, truncateForPreview } from '@/app/observatory/extractStoryContent'
import { createObservatoryDefaultPrompt } from '@/lib/observatory/auth'

export type ObservatoryFeedTab = 'foryou' | 'hackernews' | 'lw' | 'arxiv'
type SnapshotStory = {
  id: number
  title: string
  url: string
  domain: string
  byline: string
  snippet: string
  snippetHtml?: string
}

type UserProfileInput = {
  userId: number
  email: string
  documentTexts: string[]
  prompt: string
  feedbackNotes: string[]
}

const OBSERVATORY_SOURCE_FILES: Record<Exclude<ObservatoryFeedTab, 'foryou'>, { fileName: string, label: string }> = {
  hackernews: { fileName: 'hackerNewsData.json', label: 'Hacker News' },
  lw: { fileName: 'lwNewsData.json', label: 'LessWrong' },
  arxiv: { fileName: 'arxivData.json', label: 'arXiv' },
}

const OBSERVATORY_ALLOWED_DOMAINS = ['news.ycombinator.com', 'lesswrong.com', 'arxiv.org']
const OBSERVATORY_STOPWORDS = new Set(['about', 'after', 'again', 'also', 'among', 'because', 'before', 'being', 'between', 'could', 'every', 'first', 'found', 'from', 'have', 'into', 'its', 'just', 'more', 'most', 'other', 'over', 'same', 'some', 'such', 'than', 'that', 'their', 'them', 'there', 'these', 'they', 'this', 'those', 'through', 'under', 'very', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your'])

const normalizeDomain = (value: string) => value.trim().toLowerCase().replace(/^www\./, '')

const snapshotDataPath = (fileName: string) => path.join(process.cwd(), 'app', 'observatory', fileName)

const loadSnapshotStories = (tab: Exclude<ObservatoryFeedTab, 'foryou'>): SnapshotStory[] => {
  const source = OBSERVATORY_SOURCE_FILES[tab]
  try {
    const raw = fs.readFileSync(snapshotDataPath(source.fileName), 'utf-8')
    const parsed = JSON.parse(raw) as { stories?: SnapshotStory[] }
    return parsed.stories || []
  } catch {
    return []
  }
}

const extractKeywords = (values: string[], limit = 18) => {
  const keywordCounts = new Map<string, number>()
  for (const value of values) {
    const tokens = value.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []
    for (const token of tokens) {
      if (OBSERVATORY_STOPWORDS.has(token)) continue
      keywordCounts.set(token, (keywordCounts.get(token) || 0) + 1)
    }
  }
  return [...keywordCounts.entries()].sort((left, right) => right[1] - left[1]).slice(0, limit).map(([token]) => token)
}

const scoreCandidateDocument = (candidate: { title: string, excerpt: string, domain: string, url: string }, keywords: string[], prompt: string, savedUrls: Set<string>, dismissedUrls: Set<string>, likedDocumentIds: Set<number>, documentId: number | null) => {
  if (dismissedUrls.has(candidate.url)) return Number.NEGATIVE_INFINITY
  const haystack = `${candidate.title} ${candidate.excerpt} ${candidate.domain} ${prompt}`.toLowerCase()
  let score = 0
  for (const keyword of keywords) {
    if (candidate.title.toLowerCase().includes(keyword)) score += 5
    if (candidate.excerpt.toLowerCase().includes(keyword)) score += 2
    if (haystack.includes(keyword)) score += 1
  }
  if (savedUrls.has(candidate.url)) score += 4
  if (documentId != null && likedDocumentIds.has(documentId)) score += 6
  if (/arxiv|research|paper|alignment|inference|agent|reasoning|learning/i.test(candidate.title)) score += 1
  return score
}

const getOpenRouterClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })
}

const buildHeuristicProfile = ({ email, documentTexts, prompt, feedbackNotes }: UserProfileInput) => {
  const keywords = extractKeywords([...documentTexts, prompt, ...feedbackNotes], 20)
  const summary = [
    `${email} appears to prefer content around ${keywords.slice(0, 6).join(', ')}.`,
    'Favor writing with concrete reasoning, novelty, and enough depth to teach something genuinely useful.',
    feedbackNotes.length ? `Recent feedback emphasizes: ${feedbackNotes.slice(0, 3).join(' | ')}.` : 'No explicit feedback yet, so the feed should stay broad but serious.',
  ].join(' ')
  return { summary, keywords }
}

const buildAiProfile = async (input: UserProfileInput) => {
  const client = getOpenRouterClient()
  if (!client) return null
  const sampleText = input.documentTexts.slice(0, 8).map((text, index) => `Source ${index + 1}:\n${text.slice(0, 2000)}`).join('\n\n')
  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `You are building a recommendation profile from a user's own writing and links.\n\nUser email: ${input.email}\n\nCurrent tuning prompt:\n${input.prompt}\n\nRecent feedback:\n${input.feedbackNotes.join('\n') || 'None'}\n\nSample content:\n${sampleText}\n\nReturn valid JSON with this shape only:\n{"summary":"...", "keywords":["keyword1","keyword2"]}\n\nThe summary should be 2-4 sentences. Keywords should be short lowercase topical phrases.`,
    }],
    response_format: { type: 'json_object' },
    max_tokens: 500,
  })
  const content = response.choices[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(content) as { summary?: unknown, keywords?: unknown }
    const summary = typeof parsed.summary === 'string' && parsed.summary.trim() ? parsed.summary.trim() : null
    const keywordList = Array.isArray(parsed.keywords) ? parsed.keywords.filter(keyword => typeof keyword === 'string').map(keyword => keyword.toLowerCase().trim()).filter(Boolean).slice(0, 20) : []
    if (!summary) return null
    return { summary, keywords: keywordList }
  } catch {
    return null
  }
}

export const ensureObservatoryDefaultsForUser = async (userId: number, email: string) => {
  const defaultDomainUpserts = OBSERVATORY_ALLOWED_DOMAINS.map(domain => observatoryPrisma.observatorySourceDomain.upsert({
    where: { userId_domain: { userId, domain } },
    update: { status: 'approved' },
    create: { userId, domain, status: 'approved', notes: 'Built-in Observatory source.' },
  }))
  await Promise.all([
    ...defaultDomainUpserts,
    observatoryPrisma.observatoryTuningPrompt.upsert({
      where: { userId },
      update: {},
      create: { userId, prompt: createObservatoryDefaultPrompt(email) },
    }),
  ])
}

export const importSnapshotDocuments = async () => {
  for (const [tabKey, source] of Object.entries(OBSERVATORY_SOURCE_FILES) as [Exclude<ObservatoryFeedTab, 'foryou'>, { fileName: string, label: string }][]) {
    const existingDocumentCount = await observatoryPrisma.observatoryExtractedDocument.count({ where: { sourceType: tabKey } })
    if (existingDocumentCount > 0) continue
    const stories = loadSnapshotStories(tabKey)
    for (const story of stories) {
      await observatoryPrisma.observatoryExtractedDocument.upsert({
        where: { url: story.url },
        update: {
          sourceType: tabKey,
          sourceLabel: source.label,
          externalId: `${tabKey}:${story.id}`,
          title: story.title,
          domain: normalizeDomain(story.domain),
          byline: story.byline,
          excerpt: story.snippet,
          excerptHtml: story.snippetHtml || null,
        },
        create: {
          sourceType: tabKey,
          sourceLabel: source.label,
          externalId: `${tabKey}:${story.id}`,
          title: story.title,
          url: story.url,
          canonicalUrl: story.url,
          domain: normalizeDomain(story.domain),
          byline: story.byline,
          excerpt: story.snippet,
          excerptHtml: story.snippetHtml || null,
        },
      })
    }
  }
}

export const buildSeedUrlData = async (userId: number) => {
  const seedUrls = await observatoryPrisma.observatorySeedUrl.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { sourceDomain: true },
  })
  const sourceDomains = await observatoryPrisma.observatorySourceDomain.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { domain: 'asc' }],
  })
  return { seedUrls, sourceDomains }
}

export const getProfileAndPrompt = async (userId: number) => {
  const [profile, prompt, latestRevision, savedCount, dismissedCount] = await Promise.all([
    observatoryPrisma.observatoryUserProfile.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
    observatoryPrisma.observatoryTuningPrompt.findUnique({ where: { userId } }),
    observatoryPrisma.observatoryProfileRevision.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    observatoryPrisma.observatorySavedItem.count({ where: { userId } }),
    observatoryPrisma.observatoryDismissedItem.count({ where: { userId } }),
  ])
  return { profile, prompt, latestRevision, savedCount, dismissedCount }
}

export const updateTuningPrompt = async (userId: number, prompt: string) => {
  return observatoryPrisma.observatoryTuningPrompt.upsert({
    where: { userId },
    update: { prompt },
    create: { userId, prompt },
  })
}

export const resolveSourceDomainForUrl = async (userId: number, url: string) => {
  const hostname = normalizeDomain(new URL(url).hostname)
  const sourceDomain = await observatoryPrisma.observatorySourceDomain.upsert({
    where: { userId_domain: { userId, domain: hostname } },
    update: {},
    create: {
      userId,
      domain: hostname,
      status: OBSERVATORY_ALLOWED_DOMAINS.includes(hostname) ? 'approved' : 'pending',
      notes: OBSERVATORY_ALLOWED_DOMAINS.includes(hostname) ? 'Approved by built-in allowlist.' : 'Pending allowlist approval.',
    },
  })
  return sourceDomain
}

export const toStoryCard = (item: {
  id: number
  title: string
  url: string
  domain: string
  byline?: string | null
  excerpt: string
  excerptHtml?: string | null
  reason?: string | null
  iframe?: boolean | null
  documentId?: number | null
  recommendationItemId?: number | null
  sourceType?: string | null
  saved?: boolean
  dismissed?: boolean
}): StoryCard => ({
  id: item.id,
  title: item.title,
  url: item.url,
  domain: item.domain,
  byline: item.byline || '',
  snippet: item.excerpt,
  snippetHtml: item.excerptHtml || undefined,
  reason: item.reason || undefined,
  iframe: item.iframe == null ? !/arxiv\.org\//.test(item.url) : item.iframe,
  documentId: item.documentId || undefined,
  recommendationItemId: item.recommendationItemId || undefined,
  sourceType: item.sourceType || undefined,
  saved: item.saved,
  dismissed: item.dismissed,
})

export const getFeedCards = async (userId: number, tab: ObservatoryFeedTab) => {
  await importSnapshotDocuments()
  const [savedItems, dismissedItems] = await Promise.all([
    observatoryPrisma.observatorySavedItem.findMany({ where: { userId }, select: { url: true, documentId: true } }),
    observatoryPrisma.observatoryDismissedItem.findMany({ where: { userId }, select: { url: true, documentId: true } }),
  ])
  const savedUrlSet = new Set<string>(savedItems.map(item => item.url))
  const dismissedUrlSet = new Set<string>(dismissedItems.map(item => item.url))
  if (tab === 'foryou') {
    const batch = await observatoryPrisma.observatoryRecommendationBatch.findFirst({
      where: { userId, tabKey: tab, status: 'ready' },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    if (!batch) return []
    return batch.items.filter(item => !dismissedUrlSet.has(item.url)).sort((left, right) => left.rank - right.rank).map(item => toStoryCard({
      id: item.id,
      title: item.title,
      url: item.url,
      domain: item.domain,
      byline: item.byline,
      excerpt: item.snippet,
      excerptHtml: item.snippetHtml,
      reason: item.reason,
      iframe: item.iframe,
      recommendationItemId: item.id,
      documentId: item.documentId,
      sourceType: tab,
      saved: savedUrlSet.has(item.url),
      dismissed: dismissedUrlSet.has(item.url),
    }))
  }
  const documents = await observatoryPrisma.observatoryExtractedDocument.findMany({
    where: { sourceType: tab },
    orderBy: { importedAt: 'desc' },
    take: tab === 'lw' ? 50 : 100,
  })
  return documents.filter(document => !dismissedUrlSet.has(document.url)).map(document => toStoryCard({
    id: document.id,
    title: document.title,
    url: document.url,
    domain: document.domain,
    byline: document.byline,
    excerpt: document.excerpt,
    excerptHtml: document.excerptHtml,
    iframe: !/arxiv\.org\//.test(document.url),
    documentId: document.id,
    sourceType: document.sourceType,
    saved: savedUrlSet.has(document.url),
    dismissed: dismissedUrlSet.has(document.url),
  }))
}

export const buildObservatoryProfile = async ({ userId, email }: { userId: number, email: string }) => {
  const fetchedPages = await observatoryPrisma.observatoryFetchedPage.findMany({
    where: {
      sourceDomain: {
        is: { userId },
      },
    },
    select: { id: true },
  })
  const fetchedPageIds = fetchedPages.map(fetchedPage => fetchedPage.id)
  const [seedDocuments, promptRecord, feedbackEvents] = await Promise.all([
    observatoryPrisma.observatoryExtractedDocument.findMany({
      where: { sourceType: 'seed', fetchedPageId: { in: fetchedPageIds.length ? fetchedPageIds : [-1] } },
      orderBy: { importedAt: 'desc' },
      take: 24,
    }),
    observatoryPrisma.observatoryTuningPrompt.findUnique({ where: { userId } }),
    observatoryPrisma.observatoryFeedbackEvent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ])
  const prompt = promptRecord?.prompt || createObservatoryDefaultPrompt(email)
  const documentTexts = seedDocuments.map(document => `${document.title}\n${document.bodyText || document.excerpt}`)
  const feedbackNotes = feedbackEvents.map(event => `${event.eventType}${event.note ? `: ${event.note}` : ''}`)
  const aiProfile = await buildAiProfile({ userId, email, documentTexts, prompt, feedbackNotes }).catch(() => null)
  const heuristicProfile = buildHeuristicProfile({ userId, email, documentTexts, prompt, feedbackNotes })
  const profile = aiProfile || heuristicProfile
  const existingProfile = await observatoryPrisma.observatoryUserProfile.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } })
  const userProfile = existingProfile
    ? await observatoryPrisma.observatoryUserProfile.update({
      where: { id: existingProfile.id },
      data: {
        summary: profile.summary,
        keywordsJson: profile.keywords,
        sourceCount: await observatoryPrisma.observatorySourceDomain.count({ where: { userId } }),
        documentCount: seedDocuments.length,
        lastGeneratedAt: new Date(),
      },
    })
    : await observatoryPrisma.observatoryUserProfile.create({
      data: {
        userId,
        summary: profile.summary,
        keywordsJson: profile.keywords,
        sourceCount: await observatoryPrisma.observatorySourceDomain.count({ where: { userId } }),
        documentCount: seedDocuments.length,
        lastGeneratedAt: new Date(),
      },
    })
  await observatoryPrisma.observatoryProfileRevision.create({
    data: {
      userId,
      userProfileId: userProfile.id,
      summary: profile.summary,
      promptSnapshot: prompt,
      keywordsJson: profile.keywords,
      sourceCount: userProfile.sourceCount,
      documentCount: seedDocuments.length,
    },
  })
  return userProfile
}

export const refreshRecommendationBatch = async ({ userId, email }: { userId: number, email: string }) => {
  await importSnapshotDocuments()
  const [profile, promptRecord, savedItems, dismissedItems, feedbackEvents, candidateDocuments] = await Promise.all([
    observatoryPrisma.observatoryUserProfile.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
    observatoryPrisma.observatoryTuningPrompt.findUnique({ where: { userId } }),
    observatoryPrisma.observatorySavedItem.findMany({ where: { userId }, select: { url: true } }),
    observatoryPrisma.observatoryDismissedItem.findMany({ where: { userId }, select: { url: true } }),
    observatoryPrisma.observatoryFeedbackEvent.findMany({ where: { userId }, select: { documentId: true, eventType: true } }),
    observatoryPrisma.observatoryExtractedDocument.findMany({
      where: { sourceType: { in: ['hackernews', 'lw', 'arxiv'] } },
      take: 250,
      orderBy: { importedAt: 'desc' },
    }),
  ])
  const prompt = promptRecord?.prompt || createObservatoryDefaultPrompt(email)
  const profileKeywordValues = Array.isArray(profile?.keywordsJson) ? profile.keywordsJson as unknown[] : []
  const profileKeywords = profileKeywordValues.filter((keyword: unknown): keyword is string => typeof keyword === 'string')
  const promptKeywords = extractKeywords([prompt], 20)
  const feedbackKeywords = extractKeywords(feedbackEvents.map(event => event.eventType), 10)
  const scoringKeywords = [...new Set([...profileKeywords, ...promptKeywords, ...feedbackKeywords])]
  const savedUrlSet = new Set<string>(savedItems.map(item => item.url))
  const dismissedUrlSet = new Set<string>(dismissedItems.map(item => item.url))
  const likedDocumentIds = new Set<number>(feedbackEvents.filter(event => event.eventType === 'liked' && event.documentId != null).map(event => event.documentId as number))
  const rankedDocuments = candidateDocuments.map(document => ({
    document,
    score: scoreCandidateDocument({ title: document.title, excerpt: document.excerpt, domain: document.domain, url: document.url }, scoringKeywords, prompt, savedUrlSet, dismissedUrlSet, likedDocumentIds, document.id),
  })).filter(candidate => Number.isFinite(candidate.score)).sort((left, right) => right.score - left.score).slice(0, 80)
  const batch = await observatoryPrisma.observatoryRecommendationBatch.create({
    data: {
      userId,
      tabKey: 'foryou',
      status: 'ready',
      generationNote: profile?.summary || 'Recommendation batch generated from Observatory profile keywords.',
      completedAt: new Date(),
    },
  })
  for (let rank = 0; rank < rankedDocuments.length; rank += 1) {
    const rankedDocument = rankedDocuments[rank]
    const matchingKeywords = scoringKeywords.filter(keyword => rankedDocument.document.title.toLowerCase().includes(keyword) || rankedDocument.document.excerpt.toLowerCase().includes(keyword)).slice(0, 3)
    await observatoryPrisma.observatoryRecommendationItem.create({
      data: {
        batchId: batch.id,
        documentId: rankedDocument.document.id,
        title: rankedDocument.document.title,
        url: rankedDocument.document.url,
        domain: rankedDocument.document.domain,
        byline: rankedDocument.document.byline,
        snippet: rankedDocument.document.excerpt,
        snippetHtml: rankedDocument.document.excerptHtml,
        reason: matchingKeywords.length ? `Matches your profile around ${matchingKeywords.join(', ')}.` : 'Included because it matches the current Observatory profile.',
        iframe: !/arxiv\.org\//.test(rankedDocument.document.url),
        score: rankedDocument.score,
        rank: rank + 1,
      },
    })
  }
  return batch
}

export const extractSameDomainLinks = (rawHtml: string, url: string) => {
  try {
    const dom = new JSDOM(rawHtml, { url })
    const sourceUrl = new URL(url)
    const linkElements = [...dom.window.document.querySelectorAll('a[href]')]
    const sameDomainUrls: { url: string, anchorText: string }[] = []
    for (const linkElement of linkElements) {
      const href = linkElement.getAttribute('href')
      if (!href) continue
      const absoluteUrl = new URL(href, sourceUrl).toString()
      const absoluteDomain = normalizeDomain(new URL(absoluteUrl).hostname)
      if (absoluteDomain !== normalizeDomain(sourceUrl.hostname)) continue
      if (!absoluteUrl.startsWith('http://') && !absoluteUrl.startsWith('https://')) continue
      if (sameDomainUrls.some(candidateLink => candidateLink.url === absoluteUrl)) continue
      sameDomainUrls.push({ url: absoluteUrl, anchorText: linkElement.textContent?.trim() || '' })
      if (sameDomainUrls.length >= 16) break
    }
    return sameDomainUrls
  } catch {
    return []
  }
}

export const upsertFetchedDocument = async ({ sourceDomainId, url, rawHtml }: { sourceDomainId?: number | null, url: string, rawHtml: string }) => {
  const normalizedUrl = new URL(url).toString()
  const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || normalizedUrl
  const domain = normalizeDomain(new URL(normalizedUrl).hostname)
  const excerpt = truncateForPreview(extractStoryContent(rawHtml, normalizedUrl) || title, 420)
  const bodyText = extractStoryContent(rawHtml, normalizedUrl)
  const bodyHtml = extractStoryContentHtml(rawHtml, normalizedUrl)
  const fetchedPage = await observatoryPrisma.observatoryFetchedPage.upsert({
    where: { url: normalizedUrl },
    update: { sourceDomainId: sourceDomainId || null, finalUrl: normalizedUrl, domain, title, rawHtml, fetchError: null, fetchedAt: new Date() },
    create: { sourceDomainId: sourceDomainId || null, url: normalizedUrl, finalUrl: normalizedUrl, domain, title, rawHtml, fetchedAt: new Date() },
  })
  const document = await observatoryPrisma.observatoryExtractedDocument.upsert({
    where: { url: normalizedUrl },
    update: {
      fetchedPageId: fetchedPage.id,
      sourceType: 'seed',
      sourceLabel: 'Seed import',
      title,
      canonicalUrl: normalizedUrl,
      domain,
      excerpt,
      excerptHtml: bodyHtml ? `<p>${excerpt}</p>` : null,
      bodyText: bodyText || null,
      bodyHtml: bodyHtml || null,
    },
    create: {
      fetchedPageId: fetchedPage.id,
      sourceType: 'seed',
      sourceLabel: 'Seed import',
      title,
      url: normalizedUrl,
      canonicalUrl: normalizedUrl,
      domain,
      excerpt,
      excerptHtml: bodyHtml ? `<p>${excerpt}</p>` : null,
      bodyText: bodyText || null,
      bodyHtml: bodyHtml || null,
    },
  })
  const sameDomainLinks = extractSameDomainLinks(rawHtml, normalizedUrl)
  await observatoryPrisma.observatoryDocumentLink.deleteMany({ where: { documentId: document.id } })
  for (const sameDomainLink of sameDomainLinks) {
    await observatoryPrisma.observatoryDocumentLink.create({
      data: {
        documentId: document.id,
        targetUrl: sameDomainLink.url,
        anchorText: sameDomainLink.anchorText || null,
        sameDomain: true,
      },
    })
  }
  return { document, sameDomainLinks }
}

export const getAllowedDomainList = () => OBSERVATORY_ALLOWED_DOMAINS

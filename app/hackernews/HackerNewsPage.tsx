// import { execFile } from 'node:child_process'
// import { promisify } from 'node:util'

// const execFileAsync = promisify(execFile)

// type HackerNewsItem = {
//   id: number
//   title?: string
//   url?: string
//   by?: string
//   score?: number
//   descendants?: number
// }

// type StoryCard = {
//   id: number
//   title: string
//   url: string
//   domain: string
//   byline: string
//   snippet: string
// }

// const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0'
// const STORIES_TO_RENDER = 18

// export const runtime = 'nodejs'
// export const revalidate = 900

// const decodeHtmlEntities = (text: string) => {
//   return text
//     .replace(/&nbsp;/g, ' ')
//     .replace(/&amp;/g, '&')
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'")
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
// }

// const normalizeText = (text: string) => {
//   return decodeHtmlEntities(text)
//     .replace(/\r/g, ' ')
//     .replace(/\t/g, ' ')
//     .replace(/\n{3,}/g, '\n\n')
//     .replace(/[ ]{2,}/g, ' ')
//     .replace(/\s+\n/g, '\n')
//     .replace(/\n\s+/g, '\n')
//     .trim()
// }

// const htmlToText = (html: string) => {
//   return normalizeText(
//     html
//       .replace(/<script[\s\S]*?<\/script>/gi, ' ')
//       .replace(/<style[\s\S]*?<\/style>/gi, ' ')
//       .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
//       .replace(/<!--[\s\S]*?-->/g, ' ')
//       .replace(/<\/(p|h1|h2|h3|h4|h5|h6|li|blockquote|section|article|main|div)>/gi, '\n')
//       .replace(/<br\s*\/?>/gi, '\n')
//       .replace(/<[^>]+>/g, ' ')
//   )
// }

// const getStoryUrlDomain = (url: string) => {
//   try {
//     return new URL(url).hostname.replace(/^www\./, '')
//   } catch {
//     return 'unknown'
//   }
// }

// const extractLikelyEssayText = (html: string) => {
//   const cleanedHtml = html
//     .replace(/<script[\s\S]*?<\/script>/gi, '')
//     .replace(/<style[\s\S]*?<\/style>/gi, '')
//     .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
//     .replace(/<!--[\s\S]*?-->/g, '')

//   const candidateBlocks: string[] = []
//   const articleOrMainMatches = cleanedHtml.matchAll(/<(article|main)[^>]*>([\s\S]*?)<\/\1>/gi)
//   for (const match of articleOrMainMatches) {
//     candidateBlocks.push(match[2])
//   }
//   const contentClassMatches = cleanedHtml.matchAll(/<(section|div)[^>]*(class|id)=["'][^"']*(content|article|post|entry|story|main|body|text)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi)
//   for (const match of contentClassMatches) {
//     candidateBlocks.push(match[4])
//   }
//   const paragraphMatches = cleanedHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
//   const paragraphText = Array.from(paragraphMatches).map(match => htmlToText(match[1])).filter(Boolean).join('\n\n')
//   if (paragraphText) {
//     candidateBlocks.push(paragraphText)
//   }

//   const bodyMatch = cleanedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
//   if (bodyMatch?.[1]) {
//     candidateBlocks.push(bodyMatch[1])
//   } else {
//     candidateBlocks.push(cleanedHtml)
//   }

//   let bestText = ''
//   let bestScore = Number.NEGATIVE_INFINITY
//   const uniqueCandidateBlocks = Array.from(new Set(candidateBlocks))
//   for (const candidateBlock of uniqueCandidateBlocks) {
//     const text = htmlToText(candidateBlock)
//     if (text.length < 280) continue
//     const wordCount = text.split(/\s+/).filter(Boolean).length
//     if (wordCount < 60) continue
//     const linkText = htmlToText(candidateBlock.match(/<a[\s\S]*?<\/a>/gi)?.join(' ') ?? '')
//     const linkWordCount = linkText.split(/\s+/).filter(Boolean).length
//     const linkDensity = wordCount ? linkWordCount / wordCount : 0
//     const sentenceCount = (text.match(/[.!?]/g) ?? []).length
//     const score = wordCount + sentenceCount * 4 - linkDensity * 500
//     if (score > bestScore) {
//       bestScore = score
//       bestText = text
//     }
//   }

//   return bestText || htmlToText(cleanedHtml)
// }

// const truncateForPreview = (text: string, maxChars = 360) => {
//   const normalized = normalizeText(text)
//   if (normalized.length <= maxChars) return normalized
//   const candidate = normalized.slice(0, maxChars)
//   const stopCharIndex = Math.max(candidate.lastIndexOf('. '), candidate.lastIndexOf('? '), candidate.lastIndexOf('! '))
//   if (stopCharIndex > maxChars * 0.55) {
//     return `${candidate.slice(0, stopCharIndex + 1)}...`
//   }
//   const whitespaceIndex = candidate.lastIndexOf(' ')
//   if (whitespaceIndex > 0) {
//     return `${candidate.slice(0, whitespaceIndex)}...`
//   }
//   return `${candidate}...`
// }

// const fetchWithCurl = async (url: string) => {
//   try {
//     const { stdout } = await execFileAsync('curl', [
//       '-L',
//       '--compressed',
//       '--silent',
//       '--show-error',
//       '--max-time',
//       '14',
//       '--connect-timeout',
//       '6',
//       '-A',
//       'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
//       url,
//     ], { maxBuffer: 1024 * 1024 * 4 })
//     return stdout
//   } catch {
//     return ''
//   }
// }

// const fetchTopStoryIds = async () => {
//   const response = await fetch(`${HN_BASE_URL}/topstories.json`, { next: { revalidate } })
//   if (!response.ok) return []
//   const ids = (await response.json()) as number[]
//   return ids.slice(0, STORIES_TO_RENDER)
// }

// const fetchStory = async (id: number) => {
//   const response = await fetch(`${HN_BASE_URL}/item/${id}.json`, { next: { revalidate } })
//   if (!response.ok) return null
//   const item = (await response.json()) as HackerNewsItem | null
//   if (!item?.url || !item.title) return null
//   if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) return null
//   return item
// }

// const buildStoryCard = async (item: HackerNewsItem): Promise<StoryCard | null> => {
//   if (!item.url || !item.title) return null
//   const html = await fetchWithCurl(item.url)
//   const extractedText = html ? extractLikelyEssayText(html) : ''
//   const snippet = extractedText ? truncateForPreview(extractedText) : 'No readable body text found for this URL.'
//   const commentsCount = item.descendants ?? 0
//   const score = item.score ?? 0
//   return {
//     id: item.id,
//     title: item.title,
//     url: item.url,
//     domain: getStoryUrlDomain(item.url),
//     byline: `${score} points, ${commentsCount} comments`,
//     snippet,
//   }
// }

// const loadStories = async () => {
//   const topStoryIds = await fetchTopStoryIds()
//   const storyItems = await Promise.all(topStoryIds.map(fetchStory))
//   const validStoryItems = storyItems.filter((item): item is HackerNewsItem => Boolean(item))
//   const cardPromises = validStoryItems.map(item => buildStoryCard(item))
//   const cards = await Promise.all(cardPromises)
//   return cards.filter((card): card is StoryCard => Boolean(card))
// }

// const HackerNewsPage = async () => {
//   const cards = await loadStories()
//   return (
//     <main style={{ background: '#efefef', color: '#222', minHeight: '100vh', padding: '12px' }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px', fontSize: '15px' }}>
//         <strong style={{ letterSpacing: '0.8px' }}>HACKER NEWS ESSAYS</strong>
//         <span>{cards.length} stories</span>
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '6px' }}>
//         {cards.map(card => (
//           <article key={card.id} style={{ background: '#f8f8f8', border: '1px solid #d0d0d0', padding: '10px', minHeight: '210px' }}>
//             <a href={card.url} target="_blank" rel="noreferrer" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
//               <h2 style={{ margin: 0, fontSize: '37px', lineHeight: 1.06, fontFamily: 'Georgia, serif', fontWeight: 500 }}>{card.title}</h2>
//             </a>
//             <p style={{ margin: '8px 0 7px', fontSize: '13px', color: '#5b5b5b', fontStyle: 'italic' }}>{card.domain}</p>
//             <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.35 }}>{card.snippet}</p>
//             <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6a6a6a' }}>{card.byline}</p>
//           </article>
//         ))}
//       </div>
//     </main>
//   )
// }

// export default HackerNewsPage

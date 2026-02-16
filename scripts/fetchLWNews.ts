import * as fs from 'fs'
import * as path from 'path'
import { JSDOM } from 'jsdom'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { extractStoryContent, extractStoryContentHtml, truncateForPreview } from '../app/hackernews/extractStoryContent'

const execFileAsync = promisify(execFile)

const GW_BASE_URL = 'https://www.greaterwrong.com'
const STORIES_TO_FETCH = 50
const POSTS_PER_PAGE = 20
const SNIPPET_CONCURRENCY = 5
const FALLBACK_SNIPPET = 'No readable body text found for this URL.'
const OUTPUT_PATH = path.resolve(__dirname, '../app/lwnews/lwNewsData.json')

type StoryCard = {
  id: number
  title: string
  url: string
  domain: string
  byline: string
  snippet: string
  snippetHtml?: string
}

type ParsedPost = {
  postId: string
  title: string
  slug: string
  author: string
  score: number
  commentCount: number
}

const fetchHtmlWithCurl = async (url: string): Promise<string> => {
  const commonArgs = ['--compressed', '--silent', '--show-error', '--max-time', '14', '--connect-timeout', '6',
    '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    '-L', url]
  try {
    const { stdout } = await execFileAsync('curl', commonArgs, { maxBuffer: 1024 * 1024 * 4 })
    return stdout
  } catch { return '' }
}

const parseListingPage = (html: string): ParsedPost[] => {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const posts: ParsedPost[] = []
  const titleLinks = doc.querySelectorAll('a.post-title-link')
  for (const titleLink of titleLinks) {
    const href = titleLink.getAttribute('href') ?? ''
    const hrefMatch = href.match(/^\/posts\/([^/]+)\/(.+)$/)
    if (!hrefMatch) continue
    const postId = hrefMatch[1]
    const slug = hrefMatch[2]
    const rawTitle = (titleLink.textContent ?? '').replace(/\u00AD/g, '')
    const postMeta = titleLink.closest('h1')?.nextElementSibling
    if (!postMeta) continue
    const authorEl = postMeta.querySelector('a.author')
    const author = authorEl?.textContent?.trim() ?? 'Unknown'
    const karmaEl = postMeta.querySelector('.karma-value')
    const karmaText = karmaEl?.textContent?.replace(/[^0-9−-]/g, '') ?? '0'
    const score = parseInt(karmaText.replace('−', '-'), 10) || 0
    const commentEl = postMeta.querySelector('a.comment-count')
    const commentText = commentEl?.textContent?.replace(/[^0-9]/g, '') ?? '0'
    const commentCount = parseInt(commentText, 10) || 0
    posts.push({ postId, title: rawTitle, slug, author, score, commentCount })
  }
  return posts
}

const fetchListingPages = async (): Promise<ParsedPost[]> => {
  const pagesToFetch = Math.ceil(STORIES_TO_FETCH / POSTS_PER_PAGE)
  const allPosts: ParsedPost[] = []
  for (let page = 0; page < pagesToFetch; page++) {
    const offset = page * POSTS_PER_PAGE
    const url = offset === 0 ? `${GW_BASE_URL}/?sort=hot` : `${GW_BASE_URL}/?sort=hot&offset=${offset}`
    console.log(`  Fetching listing page ${page + 1}/${pagesToFetch}...`)
    const html = await fetchHtmlWithCurl(url)
    if (!html) { console.log(`  Warning: empty response for page ${page + 1}`); continue }
    const pagePosts = parseListingPage(html)
    console.log(`  Got ${pagePosts.length} posts from page ${page + 1}`)
    allPosts.push(...pagePosts)
  }
  return allPosts.slice(0, STORIES_TO_FETCH)
}

const stripTocFromBody = (bodyEl: Element | null) => {
  if (!bodyEl) return
  const tocSelectors = ['.table-of-contents', '.toc', '.post-body-toc']
  for (const sel of tocSelectors) bodyEl.querySelectorAll(sel).forEach(el => el.remove())
  const allDivs = bodyEl.querySelectorAll('div')
  for (const div of allDivs) {
    const firstText = div.firstElementChild
    if (firstText?.textContent?.trim() === 'Contents' && div.querySelector('ul a')) div.remove()
  }
}
const stripTocFromExtractedHtml = (html: string): string => {
  if (!html) return html
  const tocDom = new JSDOM(`<div>${html}</div>`)
  const container = tocDom.window.document.querySelector('div')!
  const paragraphs = container.querySelectorAll('p')
  for (const p of paragraphs) {
    if (p.textContent?.trim() === 'Contents') {
      const next = p.nextElementSibling
      if (next?.tagName === 'UL') next.remove()
      p.remove()
    }
  }
  return container.innerHTML.trim()
}
const fetchSnippetForPost = async (post: ParsedPost): Promise<{ snippet: string, snippetHtml?: string }> => {
  try {
    const postUrl = `${GW_BASE_URL}/posts/${post.postId}/${post.slug}`
    const html = await fetchHtmlWithCurl(postUrl)
    if (!html) return { snippet: FALLBACK_SNIPPET }
    const dom = new JSDOM(html)
    const bodyEl = dom.window.document.querySelector('.body-text.post-body')
    stripTocFromBody(bodyEl)
    const bodyHtml = bodyEl?.innerHTML ?? ''
    if (!bodyHtml.trim()) return { snippet: FALLBACK_SNIPPET }
    const wrappedHtml = `<html><body><article>${bodyHtml}</article></body></html>`
    const extractedText = extractStoryContent(wrappedHtml, `https://www.lesswrong.com/posts/${post.postId}/${post.slug}`)
    const extractedHtml = extractStoryContentHtml(wrappedHtml, `https://www.lesswrong.com/posts/${post.postId}/${post.slug}`)
    const cleanedHtml = stripTocFromExtractedHtml(extractedHtml ?? '')
    const snippet = extractedText ? truncateForPreview(extractedText) : FALLBACK_SNIPPET
    return { snippet, snippetHtml: cleanedHtml || undefined }
  } catch {
    return { snippet: FALLBACK_SNIPPET }
  }
}

const buildStoryCard = (post: ParsedPost, index: number): StoryCard => {
  return {
    id: index + 1,
    title: post.title,
    url: `https://www.lesswrong.com/posts/${post.postId}/${post.slug}`,
    domain: 'lesswrong.com',
    byline: `${post.score} points, ${post.commentCount} comments`,
    snippet: 'Loading article text...',
  }
}

const main = async () => {
  console.log(`Fetching top ${STORIES_TO_FETCH} LW posts via GreaterWrong...`)
  const posts = await fetchListingPages()
  console.log(`Got ${posts.length} posts. Building story cards...`)
  const cards = posts.map((post, index) => buildStoryCard(post, index))
  console.log(`Fetching snippets (${SNIPPET_CONCURRENCY} at a time)...`)
  const hydratedCards: StoryCard[] = []
  for (let i = 0; i < posts.length; i += SNIPPET_CONCURRENCY) {
    const batchPosts = posts.slice(i, i + SNIPPET_CONCURRENCY)
    const batchCards = cards.slice(i, i + SNIPPET_CONCURRENCY)
    const snippetResults = await Promise.all(batchPosts.map(post => fetchSnippetForPost(post)))
    for (let j = 0; j < batchCards.length; j++) {
      hydratedCards.push({ ...batchCards[j], snippet: snippetResults[j].snippet, snippetHtml: snippetResults[j].snippetHtml })
    }
    console.log(`  Snippets: ${Math.min(i + SNIPPET_CONCURRENCY, posts.length)}/${posts.length}`)
  }
  console.log(`Writing ${hydratedCards.length} cards to ${OUTPUT_PATH}...`)
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ fetchedAt: new Date().toISOString(), stories: hydratedCards }, null, 2))
  console.log('Done!')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

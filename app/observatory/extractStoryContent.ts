import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

const decodeHtmlEntities = (text: string) => {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const normalizeText = (text: string) => {
  return decodeHtmlEntities(text)
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .trim()
}

const htmlToText = (html: string) => {
  return normalizeText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<\/(p|h1|h2|h3|h4|h5|h6|li|blockquote|section|article|main|div)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
}

const BOT_PROTECTION_PATTERNS = [
  /just a moment/i,
  /attention required!? ?\| ?cloudflare/i,
  /enable javascript and cookies to continue/i,
  /please turn javascript on and reload the page/i,
  /cf-browser-verification|cdn-cgi\/challenge-platform|cf-chl/i,
  /verify you are human/i,
  /why do i have to complete a captcha/i,
  /please complete the security check/i,
]

const looksLikeBotProtectionPage = (html: string) => {
  const visibleText = htmlToText(html).slice(0, 9000)
  if (!visibleText) return false
  if (!BOT_PROTECTION_PATTERNS.some(pattern => pattern.test(visibleText))) return false
  const visibleWordCount = visibleText.split(/\s+/).filter(Boolean).length
  return visibleWordCount < 160
}

const isLikelyBotChallengeText = (text: string) => {
  const normalizedText = normalizeText(text)
  if (!normalizedText) return false
  if (!BOT_PROTECTION_PATTERNS.some(pattern => pattern.test(normalizedText))) return false
  const wordCount = normalizedText.split(/\s+/).filter(Boolean).length
  return wordCount < 160
}

const NAV_LINE_PATTERNS = [
  /^skip to content$/i,
  /^search$/i,
  /^menu$/i,
  /^about$/i,
  /^home$/i,
  /^sign in$/i,
  /^subscribe$/i,
  /^privacy policy$/i,
  /^terms(?: of service)?$/i,
]

const stripBoilerplateLines = (text: string) => {
  const candidateLines = normalizeText(text).split('\n')
  const filteredLines = candidateLines.filter(line => {
    const trimmed = line.trim()
    if (!trimmed) return false
    if (trimmed.length < 3) return false
    if (/^[#*|/:;,+\-\[\]{}()<>'"`~._]+$/.test(trimmed)) return false
    if (NAV_LINE_PATTERNS.some(pattern => pattern.test(trimmed))) return false
    if (/^(?:[A-Za-z0-9_-]+\s*:\s*){2,}[A-Za-z0-9_-]+$/.test(trimmed)) return false
    if (/^[\w-]*\[[^\]]+\][\w-]*$/.test(trimmed)) return false
    return true
  })
  return normalizeText(filteredLines.join('\n'))
}

const extractFromParagraphWindows = (html: string) => {
  const paragraphMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(match => htmlToText(match[1])).filter(Boolean)
  if (!paragraphMatches.length) return ''
  let bestWindowText = ''
  let bestWindowScore = Number.NEGATIVE_INFINITY
  const paragraphCount = paragraphMatches.length
  for (let start = 0; start < paragraphCount; start += 1) {
    const maxEnd = Math.min(paragraphCount, start + 8)
    for (let end = start + 2; end <= maxEnd; end += 1) {
      const windowParagraphs = paragraphMatches.slice(start, end)
      const windowText = windowParagraphs.join('\n\n')
      const wordCount = windowText.split(/\s+/).filter(Boolean).length
      const sentenceCount = (windowText.match(/[.!?]/g) ?? []).length
      const shortLineCount = windowText.split('\n').filter(line => line.trim().length > 0 && line.trim().length < 28).length
      const score = wordCount + sentenceCount * 10 - shortLineCount * 14
      if (wordCount < 80) continue
      if (score > bestWindowScore) {
        bestWindowScore = score
        bestWindowText = windowText
      }
    }
  }
  return bestWindowText
}

const extractWithReadability = (html: string, url?: string) => {
  try {
    const dom = new JSDOM(html, { url: url ?? 'https://news.ycombinator.com/' })
    const reader = new Readability(dom.window.document)
    return reader.parse()
  } catch {
    return null
  }
}

const ALLOWED_READABILITY_TAGS = new Set(['P', 'BR', 'EM', 'STRONG', 'B', 'I', 'A', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'CODE', 'PRE'])

const sanitizeReadabilityHtml = (html: string, url?: string) => {
  try {
    const dom = new JSDOM(`<article>${html}</article>`, { url: url ?? 'https://news.ycombinator.com/' })
    const candidateElements = [...dom.window.document.body.querySelectorAll('*')]
    for (const candidateElement of candidateElements) {
      if (!ALLOWED_READABILITY_TAGS.has(candidateElement.tagName)) {
        candidateElement.replaceWith(...candidateElement.childNodes)
        continue
      }
      for (const attributeName of candidateElement.getAttributeNames()) {
        if (candidateElement.tagName === 'A' && attributeName === 'href') continue
        candidateElement.removeAttribute(attributeName)
      }
      if (candidateElement.tagName === 'A') {
        const href = candidateElement.getAttribute('href') ?? ''
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
          candidateElement.removeAttribute('href')
        }
      }
    }
    return dom.window.document.body.innerHTML.trim()
  } catch {
    return ''
  }
}

export const extractStoryContent = (html: string, url?: string) => {
  const normalizedHtml = html.trim()
  if (!normalizedHtml) return ''
  const readability = extractWithReadability(normalizedHtml, url)
  const readabilityText = stripBoilerplateLines(normalizeText(readability?.textContent ?? ''))
  if (readabilityText && !isLikelyBotChallengeText(readabilityText)) return readabilityText
  const paragraphWindowText = extractFromParagraphWindows(normalizedHtml)
  if (paragraphWindowText) {
    const normalizedParagraphWindowText = stripBoilerplateLines(paragraphWindowText)
    if (normalizedParagraphWindowText && !isLikelyBotChallengeText(normalizedParagraphWindowText)) return normalizedParagraphWindowText
  }
  const plainText = stripBoilerplateLines(htmlToText(normalizedHtml))
  if (plainText && !isLikelyBotChallengeText(plainText)) return plainText
  if (looksLikeBotProtectionPage(normalizedHtml)) return ''
  return ''
}

export const extractStoryContentHtml = (html: string, url?: string) => {
  const normalizedHtml = html.trim()
  if (!normalizedHtml) return ''
  const readability = extractWithReadability(normalizedHtml, url)
  const readabilityText = stripBoilerplateLines(normalizeText(readability?.textContent ?? ''))
  if (readabilityText && !isLikelyBotChallengeText(readabilityText)) {
    const readabilityHtml = sanitizeReadabilityHtml(readability?.content ?? '', url)
    if (readabilityHtml) return readabilityHtml
  }
  const paragraphWindowText = extractFromParagraphWindows(normalizedHtml)
  if (paragraphWindowText) {
    const normalizedParagraphWindowText = stripBoilerplateLines(paragraphWindowText)
    if (normalizedParagraphWindowText && !isLikelyBotChallengeText(normalizedParagraphWindowText)) {
      return normalizedParagraphWindowText.split('\n\n').map(paragraphText => `<p>${escapeHtml(paragraphText)}</p>`).join('')
    }
  }
  const plainText = stripBoilerplateLines(htmlToText(normalizedHtml))
  if (plainText && !isLikelyBotChallengeText(plainText)) {
    return plainText.split('\n\n').map(paragraphText => `<p>${escapeHtml(paragraphText)}</p>`).join('')
  }
  if (looksLikeBotProtectionPage(normalizedHtml)) return ''
  return ''
}

export const truncateForPreview = (text: string, maxChars = 360) => {
  const normalized = normalizeText(text)
  if (normalized.length <= maxChars) return normalized
  const candidate = normalized.slice(0, maxChars)
  const stopCharIndex = Math.max(candidate.lastIndexOf('. '), candidate.lastIndexOf('? '), candidate.lastIndexOf('! '))
  if (stopCharIndex > maxChars * 0.55) {
    return `${candidate.slice(0, stopCharIndex + 1)}...`
  }
  const whitespaceIndex = candidate.lastIndexOf(' ')
  if (whitespaceIndex > 0) {
    return `${candidate.slice(0, whitespaceIndex)}...`
  }
  return `${candidate}...`
}

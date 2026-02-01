import { marked } from 'marked'
import DOMPurify from 'dompurify'

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*?>/i
const MARKDOWN_PATTERNS = [
  /\*\*[^*]+\*\*/,  // bold
  /\*[^*]+\*/,      // italic
  /__[^_]+__/,      // bold underscore
  /_[^_]+_/,        // italic underscore
  /\[[^\]]+\]\([^)]+\)/, // links
  /^#{1,6}\s/m,     // headings
  /^\s*[-*+]\s/m,   // unordered lists
  /^\s*\d+\.\s/m,   // ordered lists
  /`[^`]+`/,        // inline code
]
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['a', 'b', 'strong', 'i', 'em', 'u', 'code', 'pre', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'span', 'div'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'class'],
}

export const sanitize = (html: string) => DOMPurify.sanitize(html, SANITIZE_CONFIG)
export const isHtml = (text: string) => HTML_TAG_REGEX.test(text)
export const isMarkdown = (text: string) => MARKDOWN_PATTERNS.some(pattern => pattern.test(text))

const IMAGE_URL_PATTERN = /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?$/i
export const isImageUrl = (value: string) => IMAGE_URL_PATTERN.test(value.trim())

export const parseImageUrls = (value: string): string[] => {
  if (!value) return []
  const parts = value.split(/(?=https?:\/\/)/).map(s => s.trim()).filter(s => s.length > 0)
  const validUrls = parts.filter(url => isImageUrl(url))
  return validUrls
}

export const isImageColumn = (column: string) => column.toLowerCase() === 'image' || column.toLowerCase() === 'images' || column.toLowerCase() === 'photourls'

export type CellContent = 
  | { type: 'text'; value: string }
  | { type: 'html'; value: string }
  | { type: 'images'; urls: string[] }

export const getCellContent = (value: string, column: string): CellContent => {
  if (!value) return { type: 'text', value: '' }
  if (isImageColumn(column)) {
    const urls = parseImageUrls(value)
    if (urls.length > 0) return { type: 'images', urls }
  }
  const imageUrls = parseImageUrls(value)
  if (imageUrls.length > 0) {
    return { type: 'images', urls: imageUrls }
  }
  if (isHtml(value)) {
    return { type: 'html', value: sanitize(value) }
  }
  if (isMarkdown(value)) {
    const html = marked.parse(value, { async: false }) as string
    return { type: 'html', value: sanitize(html) }
  }
  return { type: 'text', value }
}

export const extractAllImages = (rows: Record<string, string>[], columns: string[]): string[] => {
  const images: string[] = []
  for (const row of rows) {
    for (const column of columns) {
      const value = row[column] || ''
      const urls = parseImageUrls(value)
      images.push(...urls)
    }
  }
  return images
}

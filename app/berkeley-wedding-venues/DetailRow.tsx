'use client'
import { useEffect, useRef, useState } from 'react'
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
const sanitize = (html: string) => DOMPurify.sanitize(html, SANITIZE_CONFIG)
const isHtml = (text: string) => HTML_TAG_REGEX.test(text)
const isMarkdown = (text: string) => MARKDOWN_PATTERNS.some(pattern => pattern.test(text))
const renderContent = (value: string): string => {
  if (!value) return ''
  if (isHtml(value)) return sanitize(value)
  if (isMarkdown(value)) return sanitize(marked.parse(value, { async: false }) as string)
  return value
}

const isImageUrl = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.length === 0) return false
  // Check for image extensions (with or without query params)
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$|#|&)/i
  if (imageExtensions.test(trimmed)) return true
  // Also check for known image CDN patterns
  if (trimmed.includes('/image') && trimmed.startsWith('http')) return true
  return false
}

const extractImageUrls = (value: string): string[] => {
  if (!value || typeof value !== 'string') return []
  const trimmed = value.trim()
  if (trimmed.length === 0) return []
  if (trimmed.includes('|')) {
    return trimmed.split('|').map(url => url.trim()).filter(url => isImageUrl(url))
  }
  if (isImageUrl(trimmed)) {
    return [trimmed]
  }
  return []
}

const DetailRow = ({row, columns, rowName, onPhotoClick}: {row: Record<string, string>, columns: string[], rowName: string, onPhotoClick: (index: number) => void}) => {
  const detailTextRef = useRef<HTMLTableElement | null>(null)
  const [detailTextHeight, setDetailTextHeight] = useState<number | null>(null)
  useEffect(() => {
    if (!detailTextRef.current) return
    const element = detailTextRef.current
    const updateHeight = () => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height)
      setDetailTextHeight((prev) => prev === nextHeight ? prev : nextHeight)
    }
    updateHeight()
    const observer = new ResizeObserver(() => updateHeight())
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const allImageUrls: string[] = []
  for (const column of columns) {
    const value = row[column] || ''
    const imageUrls = extractImageUrls(value)
    allImageUrls.push(...imageUrls)
  }
  return (
    <div className="flex flex-row items-center gap-3 bg-[#222] p-3 rounded-lg">
      <div>
        <div className="font-medium text-base" dangerouslySetInnerHTML={{__html: renderContent(rowName)}} />
        <table ref={detailTextRef} className="text-sm">
          <tbody>
            {columns.slice(1).map((column) => {
              const value = row[column] || ''
              if (value.length === 0) return null
              // Skip displaying Image column as text if it's a URL (it will be shown as an image)
              if (column.toLowerCase() === 'image' && isImageUrl(value)) return null
              return (
                <tr key={column}>
                  <td className="font-medium text-gray-400 pr-2 align-top whitespace-nowrap">{column}:</td>
                  <td className="text-white" dangerouslySetInnerHTML={{__html: renderContent(value)}} />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {allImageUrls.length > 0 && (
        <div className="flex items-center flex-wrap gap-2" style={{height: detailTextHeight || 'auto'}}>
          {allImageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${rowName} photo ${i + 1}`}
              onClick={() => onPhotoClick(i)}
              className="h-full w-auto cursor-pointer object-cover"
              style={{maxHeight: detailTextHeight || '100%'}}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DetailRow

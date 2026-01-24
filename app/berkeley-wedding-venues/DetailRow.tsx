'use client'
import { useEffect, useRef, useState } from 'react'

const isImageUrl = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.length === 0) return false
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$|#)/i
  return imageExtensions.test(trimmed)
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
  const detailTextRef = useRef<HTMLDivElement | null>(null)
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
      <div ref={detailTextRef} className="flex flex-col gap-1 text-sm">
        <div className="font-medium text-base">{rowName}</div>
        {columns.map((column) => {
          const value = row[column] || ''
          if (value.length === 0) return null
          return (
            <div key={column}>
              {column}: {value}
            </div>
          )
        })}
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

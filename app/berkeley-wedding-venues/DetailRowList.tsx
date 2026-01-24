'use client'
import { useState, useEffect } from 'react'
import DetailRow from './DetailRow'

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

const DetailRowList = ({rows, columns, rowNameKey}: {rows: Record<string, string>[], columns: string[], rowNameKey: string}) => {
  const allPhotos: Array<{url: string, rowName: string}> = []
  const rowPhotoStartIndices: number[] = []
  let currentIndex = 0
  for (const row of rows) {
    rowPhotoStartIndices.push(currentIndex)
    for (const column of columns) {
      const value = row[column] || ''
      const imageUrls = extractImageUrls(value)
      for (const url of imageUrls) {
        allPhotos.push({url, rowName: row[rowNameKey] || ''})
        currentIndex++
      }
    }
  }
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const selectedImage = selectedImageIndex !== null ? allPhotos[selectedImageIndex] : null
  useEffect(() => {
    if (selectedImageIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1)
      } else if (e.key === 'ArrowRight' && selectedImageIndex < allPhotos.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1)
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageIndex, allPhotos.length])
  const handlePhotoClick = (rowIndex: number, photoIndexInRow: number) => {
    const startIndex = rowPhotoStartIndices[rowIndex]
    if (startIndex === undefined) return
    setSelectedImageIndex(startIndex + photoIndexInRow)
  }
  return (
    <>
      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        {rows.map((row, rowIndex) => {
          const rowName = row[rowNameKey] || `Row ${rowIndex + 1}`
          const rowImageUrls: string[] = []
          for (const column of columns) {
            const value = row[column] || ''
            const imageUrls = extractImageUrls(value)
            rowImageUrls.push(...imageUrls)
          }
          return (
            <DetailRow
              key={rowName}
              row={row}
              columns={columns}
              rowName={rowName}
              onPhotoClick={(photoIndexInRow) => handlePhotoClick(rowIndex, photoIndexInRow)}
            />
          )
        })}
      </div>
      {selectedImage && (
        <div
          onClick={() => setSelectedImageIndex(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            padding: '20px'
          }}
        >
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '90vw', maxHeight: '90vh'}}>
            <div style={{color: 'white', fontSize: '18px', fontWeight: 500}}>{selectedImage.rowName}</div>
            <img
              src={selectedImage.url}
              alt={selectedImage.rowName}
              style={{maxWidth: '100%', maxHeight: 'calc(90vh - 60px)', objectFit: 'contain'}}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default DetailRowList

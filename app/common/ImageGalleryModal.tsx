'use client'
import { useState, useEffect, useCallback } from 'react'

const ImageGalleryModal = ({images, initialIndex, onClose}:{images: string[], initialIndex: number, onClose: () => void}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goToPrev, goToNext])
  if (images.length === 0) return null
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img src={images[currentIndex]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" />
        {images.length > 1 && (
          <>
            <button onClick={goToPrev} className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl cursor-pointer hover:opacity-70">‹</button>
            <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl cursor-pointer hover:opacity-70">›</button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm">{currentIndex + 1} / {images.length}</div>
          </>
        )}
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl cursor-pointer hover:opacity-70">✕</button>
    </div>
  )
}

export default ImageGalleryModal

'use client'
import { useState, useRef, useCallback } from 'react'

type DragDropListProps<T> = {
  items: T[]
  keyExtractor: (item: T) => string | number
  renderItem: (item: T, index: number, dragHandleProps: DragHandleProps) => React.ReactNode
  onReorder: (items: T[]) => void
}

export type DragHandleProps = {
  draggable: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  style?: React.CSSProperties
}

const DragDropList = <T,>({ items, keyExtractor, renderItem, onReorder }: DragDropListProps<T>) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragNodeRef = useRef<number | null>(null)

  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index)
    dragNodeRef.current = index
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragNodeRef.current = null
  }, [])

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragNodeRef.current !== index) {
      setDragOverIndex(index)
    }
  }, [])

  const handleDrop = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const fromIndex = dragNodeRef.current
    if (fromIndex === null || fromIndex === index) return
    const newItems = [...items]
    const [removed] = newItems.splice(fromIndex, 1)
    newItems.splice(index, 0, removed)
    onReorder(newItems)
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragNodeRef.current = null
  }, [items, onReorder])

  return (
    <>
      {items.map((item, index) => {
        const isDragging = draggedIndex === index
        const isDragOver = dragOverIndex === index && draggedIndex !== index
        const dragHandleProps: DragHandleProps = {
          draggable: true,
          onDragStart: handleDragStart(index),
          onDragEnd: handleDragEnd,
          onDragOver: handleDragOver(index),
          onDrop: handleDrop(index),
          style: {
            opacity: isDragging ? 0.5 : 1,
            background: isDragOver ? 'rgba(255,255,255,0.1)' : undefined,
            cursor: 'grab',
          }
        }
        return (
          <div key={keyExtractor(item)} {...dragHandleProps}>
            {renderItem(item, index, dragHandleProps)}
          </div>
        )
      })}
    </>
  )
}

export default DragDropList

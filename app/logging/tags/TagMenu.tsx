'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Tag } from '../types'

const TagMenu = ({ tag, position, onEdit, onClose }:{ tag: Tag, position: { x: number, y: number }, onEdit: () => void, onClose: () => void }) => {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) onClose()
    }
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])
  const menuItems = [
    { label: 'Open Tag Page', action: () => { router.push(`/logging/tag/${tag.id}`); onClose() } },
    { label: 'Edit Tag', action: () => { onEdit(); onClose() } },
  ]
  return (
    <div ref={ref} className="fixed bg-gray-800 text-white text-sm py-1 z-50" style={{ left: position.x, top: position.y }}>
      {menuItems.map(item => (
        <button key={item.label} className="block w-full text-left px-4 py-1 hover:bg-white/10 cursor-pointer" onClick={item.action}>{item.label}</button>
      ))}
    </div>
  )
}

export default TagMenu

"use client"

import { ReactElement, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

const MyTooltip = ({
  children,
  content,
  placement = "top-start",
  maxWidth = 400,
  interactive = false,
  noBox = false,
  wrapperClassName = '',
  noMargin=true,
  inlineBlock = false,
}: {
  children: ReactElement;
  content: React.ReactNode;
  placement?: Placement;
  interactive?: boolean;
  maxWidth?: number;
  noBox?: boolean;
  wrapperClassName?: string;
  noMargin?: boolean;
  inlineBlock?: boolean;
}) => {
  const wrapperRef = useRef<HTMLSpanElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [position, setPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 })
  const handleMouseEnter = () => setIsVisible(true)
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (interactive && tooltipRef.current && e.relatedTarget instanceof Node && tooltipRef.current.contains(e.relatedTarget)) return
    setIsVisible(false)
  }
  const handleTooltipMouseLeave = (e: React.MouseEvent) => {
    if (interactive && wrapperRef.current && e.relatedTarget instanceof Node && wrapperRef.current.contains(e.relatedTarget)) return
    setIsVisible(false)
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!isVisible) return
    const wrapper = wrapperRef.current
    const tooltip = tooltipRef.current
    if (!wrapper || !tooltip) return
    const rect = wrapper.getBoundingClientRect()
    const tipRect = tooltip.getBoundingClientRect()
    const margin = noMargin ? 0 : 8
    let top = 0
    let left = 0
    if (placement === 'top') {
      top = rect.top - tipRect.height - margin
      left = rect.left + rect.width / 2 - tipRect.width / 2
    } else if (placement === 'top-start') {
      top = rect.top - tipRect.height - margin
      left = rect.left
    } else if (placement === 'top-end') {
      top = rect.top - tipRect.height - margin
      left = rect.right - tipRect.width
    } else if (placement === 'bottom') {
      top = rect.bottom + margin
      left = rect.left + rect.width / 2 - tipRect.width / 2
    } else if (placement === 'bottom-start') {
      top = rect.bottom + margin
      left = rect.left
    } else if (placement === 'bottom-end') {
      top = rect.bottom + margin
      left = rect.right - tipRect.width
    } else if (placement === 'left') {
      top = rect.top + rect.height / 2 - tipRect.height / 2
      left = rect.left - tipRect.width - margin
    } else if (placement === 'left-start') {
      top = rect.top
      left = rect.left - tipRect.width - margin
    } else if (placement === 'left-end') {
      top = rect.bottom - tipRect.height
      left = rect.left - tipRect.width - margin
    } else if (placement === 'right') {
      top = rect.top + rect.height / 2 - tipRect.height / 2
      left = rect.right + margin
    } else if (placement === 'right-start') {
      top = rect.top
      left = rect.right + margin
    } else if (placement === 'right-end') {
      top = rect.bottom - tipRect.height
      left = rect.right + margin
    }
    setPosition({ top, left })
  }, [isVisible, placement, noMargin, content, maxWidth])

  return (
    <span
      className={`relative ${inlineBlock ? 'inline-block' : 'inline'} group focus:outline-none ${wrapperClassName}`}
      tabIndex={0}
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isMounted && isVisible ? createPortal(
        <div
          ref={tooltipRef}
          onMouseEnter={interactive ? handleMouseEnter : undefined}
          onMouseLeave={interactive ? handleTooltipMouseLeave : undefined}
          className={`
            fixed z-50
            ${noBox ? 'bg-transparent' : 'bg-black/65 text-white rounded-lg p-2'}
            text-sm
            ${interactive ? '' : 'pointer-events-none'}
          `}
          style={{
            maxWidth: maxWidth,
            width: 'max-content',
            top: position.top,
            left: position.left
          }}
        >
          {content}
        </div>,
        document.body
      ) : null}
    </span>
  )
}

export default MyTooltip

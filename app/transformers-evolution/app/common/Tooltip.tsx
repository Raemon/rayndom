"use client"

import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
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

type TooltipAs = 'span' | 'g'

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
  as = 'span',
  wrapperStyle,
  contentClassName = '',
  zIndex = 50,
  leaveDelayMs = 0,
}: {
  children: ReactNode;
  content: React.ReactNode;
  placement?: Placement;
  interactive?: boolean;
  maxWidth?: number;
  noBox?: boolean;
  wrapperClassName?: string;
  noMargin?: boolean;
  inlineBlock?: boolean;
  as?: TooltipAs;
  wrapperStyle?: CSSProperties;
  contentClassName?: string;
  zIndex?: number;
  leaveDelayMs?: number;
}) => {
  const wrapperRef = useRef<HTMLSpanElement | SVGGElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [position, setPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 })

  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  const scheduleHide = () => {
    clearHideTimer()
    if (leaveDelayMs > 0) {
      hideTimerRef.current = setTimeout(() => setIsVisible(false), leaveDelayMs)
    } else {
      setIsVisible(false)
    }
  }

  const handleMouseEnter = () => {
    clearHideTimer()
    setIsVisible(true)
  }

  const handleMouseLeave = (e: MouseEvent) => {
    if (interactive && tooltipRef.current && e.relatedTarget instanceof Node && tooltipRef.current.contains(e.relatedTarget)) return
    scheduleHide()
  }

  const handleTooltipMouseLeave = (e: MouseEvent) => {
    if (interactive && wrapperRef.current && e.relatedTarget instanceof Node && wrapperRef.current.contains(e.relatedTarget)) return
    scheduleHide()
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => () => clearHideTimer(), [])

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
    const pad = 8
    const vw = typeof window !== 'undefined' ? window.innerWidth : 0
    const vh = typeof window !== 'undefined' ? window.innerHeight : 0
    if (vw > 0 && vh > 0) {
      left = Math.max(pad, Math.min(left, vw - tipRect.width - pad))
      top = Math.max(pad, Math.min(top, vh - tipRect.height - pad))
    }
    setPosition({ top, left })
  }, [isVisible, placement, noMargin, content, maxWidth])

  const portal = isMounted && isVisible ? createPortal(
    <div
      ref={tooltipRef}
      onMouseEnter={interactive ? handleMouseEnter : undefined}
      onMouseLeave={interactive ? handleTooltipMouseLeave : undefined}
      className={`
            fixed
            ${noBox ? 'bg-transparent' : 'bg-black/65 text-white rounded-lg p-2'}
            text-sm
            ${interactive ? '' : 'pointer-events-none'}
            ${contentClassName}
          `}
      style={{
        maxWidth: maxWidth,
        width: 'max-content',
        top: position.top,
        left: position.left,
        zIndex,
      }}
    >
      {content}
    </div>,
    document.body
  ) : null

  if (as === 'g') {
    return (
      <g
        className={`outline-none focus:outline-none ${wrapperClassName}`}
        tabIndex={0}
        ref={wrapperRef as RefObject<SVGGElement>}
        style={wrapperStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => { clearHideTimer(); setIsVisible(true) }}
        onBlur={() => { clearHideTimer(); setIsVisible(false) }}
      >
        {children}
        {portal}
      </g>
    )
  }

  return (
    <span
      className={`relative ${inlineBlock ? 'inline-block' : 'inline'} group focus:outline-none ${wrapperClassName}`}
      tabIndex={0}
      ref={wrapperRef as RefObject<HTMLSpanElement>}
      style={wrapperStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => { clearHideTimer(); setIsVisible(true) }}
      onBlur={() => { clearHideTimer(); setIsVisible(false) }}
    >
      {children}
      {portal}
    </span>
  )
}

export default MyTooltip

import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="150" height="150" viewBox="0 0 64 64">
          <path d="M18 12h20l8 8v32H18V12z" fill="none" stroke="#111827" strokeWidth="4" strokeLinejoin="miter"/>
          <path d="M38 12v10h10" fill="none" stroke="#111827" strokeWidth="4" strokeLinejoin="miter"/>
          <path d="M24 30h16" fill="none" stroke="#111827" strokeWidth="4" strokeLinecap="square"/>
          <path d="M24 38h16" fill="none" stroke="#111827" strokeWidth="4" strokeLinecap="square"/>
          <path d="M24 46h10" fill="none" stroke="#111827" strokeWidth="4" strokeLinecap="square"/>
          <circle cx="44" cy="46" r="6" fill="#22c55e"/>
        </svg>
      </div>
    ),
    size
  )
}

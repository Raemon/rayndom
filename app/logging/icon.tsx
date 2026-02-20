import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 64 64">
          <path d="M18 12h20l8 8v32H18V12z" fill="none" stroke="#111827" strokeWidth="6" strokeLinejoin="miter"/>
          <path d="M38 12v10h10" fill="none" stroke="#111827" strokeWidth="6" strokeLinejoin="miter"/>
          <circle cx="44" cy="46" r="7" fill="#22c55e"/>
        </svg>
      </div>
    ),
    size
  )
}

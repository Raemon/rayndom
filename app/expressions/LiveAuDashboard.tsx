'use client'

const AU_LABELS: Record<string, string> = {
  AU01: 'inner brow raiser',
  AU02: 'outer brow raiser',
  AU04: 'brow lowerer',
  AU05: 'upper lid raiser',
  AU06: 'cheek raiser',
  AU07: 'lid tightener',
  AU09: 'nose wrinkler',
  AU10: 'upper lip raiser',
  AU11: 'nasolabial deepener',
  AU12: 'lip corner puller',
  AU14: 'dimpler',
  AU15: 'lip corner depressor',
  AU17: 'chin raiser',
  AU20: 'lip stretcher',
  AU23: 'lip tightener',
  AU24: 'lip pressor',
  AU25: 'lips part',
  AU26: 'jaw drop',
  AU28: 'lip suck',
  AU43: 'eyes closed',
}

const AU_ORDER = Object.keys(AU_LABELS)

const LiveAuDashboard = ({ aus }:{ aus: Record<string, number> }) => {
  return (
    <div className="font-mono text-xs">
      {AU_ORDER.map(au => {
        const value = aus[au]
        const pct = typeof value === 'number' ? Math.round(value * 100) : null
        const widthStyle = typeof value === 'number' ? { width: `${Math.max(0, Math.min(100, value * 100))}%` } : { width: '0%' }
        return (
          <div key={au} className="flex items-center gap-2 leading-5">
            <span className="w-12 text-neutral-500">{au}</span>
            <span className="w-40 text-neutral-400 truncate">{AU_LABELS[au]}</span>
            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 relative">
              <div className="absolute inset-y-0 left-0 bg-neutral-700 dark:bg-neutral-300" style={widthStyle} />
            </div>
            <span className="w-10 text-right tabular-nums text-neutral-600">{pct === null ? '—' : `${pct}`}</span>
          </div>
        )
      })}
    </div>
  )
}

export default LiveAuDashboard

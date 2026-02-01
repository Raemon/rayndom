'use client'
import { useState, useImperativeHandle, forwardRef, useCallback } from 'react'

type PredictTagsButtonProps = {
  loadTagInstances: () => void
  loadTimeblocks: () => void
  onIsPredictingChange?: (isPredicting: boolean) => void
}

export type PredictTagsButtonRef = {
  predictTags: () => Promise<void>
  isPredicting: boolean
}

const PredictTagsButton = forwardRef<PredictTagsButtonRef, PredictTagsButtonProps>(({ loadTagInstances, loadTimeblocks, onIsPredictingChange }, ref) => {
  const [isPredicting, setIsPredicting] = useState(false)
  const floorTo15 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  const predictTagsForCurrentBlock = useCallback(async () => {
    setIsPredicting(true)
    onIsPredictingChange?.(true)
    try {
      const currentBlockDatetime = floorTo15(new Date()).toISOString()
      const res = await fetch('/api/timer/predict-tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datetime: currentBlockDatetime }) })
      const json = await res.json()
      if (json.createdInstances?.length > 0) loadTagInstances()
      if (json.aiNotes !== undefined) loadTimeblocks()
      console.log('Prediction result:', json)
    } catch (e) {
      console.error('Prediction failed:', e)
    } finally {
      setIsPredicting(false)
      onIsPredictingChange?.(false)
    }
  }, [loadTagInstances, loadTimeblocks, onIsPredictingChange])
  useImperativeHandle(ref, () => ({
    predictTags: predictTagsForCurrentBlock,
    isPredicting,
  }), [predictTagsForCurrentBlock, isPredicting])
  return (
    <button onClick={predictTagsForCurrentBlock} disabled={isPredicting} className="px-2 py-1 bg-purple-100 disabled:opacity-50">
      {isPredicting ? 'Predicting...' : 'Predict Tags'}
    </button>
  )
})

PredictTagsButton.displayName = 'PredictTagsButton'

export default PredictTagsButton
export type { PredictTagsButtonProps }

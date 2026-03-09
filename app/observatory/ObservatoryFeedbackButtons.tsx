'use client'
import { useState } from 'react'
import { StoryCard } from './hackerNewsTypes'

const ObservatoryFeedbackButtons = ({ story, compact, onFeedbackApplied }:{ story: StoryCard, compact?: boolean, onFeedbackApplied?: (eventType: 'saved' | 'dismissed') => void }) => {
  const [saving, setSaving] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const submitFeedback = async (eventType: 'saved' | 'dismissed') => {
    const setLoading = eventType === 'saved' ? setSaving : setDismissing
    setLoading(true)
    try {
      await fetch('/api/observatory/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          url: story.url,
          documentId: story.documentId,
          recommendationItemId: story.recommendationItemId,
        }),
      })
      onFeedbackApplied?.(eventType)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className={`flex items-center gap-2 font-sans ${compact ? 'mt-1 text-[10px]' : 'mt-2 text-[11px]'}`}>
      <button onClick={() => { void submitFeedback('saved') }} disabled={saving || !!story.saved} className="cursor-pointer bg-transparent p-0 text-[#6b665b] hover:text-[#1f1f1f] disabled:opacity-50">{story.saved ? 'Saved' : saving ? 'Saving…' : 'Save'}</button>
      <button onClick={() => { void submitFeedback('dismissed') }} disabled={dismissing || !!story.dismissed} className="cursor-pointer bg-transparent p-0 text-[#6b665b] hover:text-[#1f1f1f] disabled:opacity-50">{story.dismissed ? 'Dismissed' : dismissing ? 'Dismissing…' : 'Dismiss'}</button>
    </div>
  )
}

export default ObservatoryFeedbackButtons

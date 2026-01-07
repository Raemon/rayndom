'use client'
import { useState, useMemo } from 'react'

type TranscriptEntry = { start: number; text: string }

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

type Sentence = { text: string; timestamp?: number }

const TranscriptViewer = ({transcriptWithTimestamps, transcript, onTimestampClick}:{transcriptWithTimestamps: TranscriptEntry[], transcript: string, onTimestampClick: (timestamp: number) => void}) => {
  const [expanded, setExpanded] = useState(false)

  const hasTimestamps = transcriptWithTimestamps && transcriptWithTimestamps.length > 0

  const sentences = useMemo(() => {
    if (hasTimestamps) {
      const result: Sentence[] = []
      let currentSentence = ''
      let currentTimestamp = transcriptWithTimestamps[0]?.start || 0
      for (const entry of transcriptWithTimestamps) {
        const parts = entry.text.split(/(?<=[.!?])\s+/)
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]
          if (currentSentence === '') currentTimestamp = entry.start
          currentSentence += (currentSentence ? ' ' : '') + part
          if (/[.!?]$/.test(part)) {
            result.push({ text: currentSentence.trim(), timestamp: currentTimestamp })
            currentSentence = ''
          }
        }
      }
      if (currentSentence.trim()) result.push({ text: currentSentence.trim(), timestamp: currentTimestamp })
      return result
    } else {
      return transcript.split(/(?<=[.!?])\s+/).filter(s => s.trim()).map((s): Sentence => ({ text: s.trim() }))
    }
  }, [transcriptWithTimestamps, transcript, hasTimestamps])

  return (
    <div className="transcript-viewer" onClick={() => setExpanded(true)}>
      <div className="transcript-header">
        <h4 className="transcript-label">Transcript</h4>
        <button className="transcript-toggle" onClick={(e) => {
          e.stopPropagation()
          setExpanded(!expanded)
        }}>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <div className={`transcript-content ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className="transcript-text">
          {sentences.map((sentence, index) => (
            <div key={index} className="transcript-sentence">
              {sentence.timestamp !== undefined && (
                <button
                  className="timestamp-link"
                  onClick={() => onTimestampClick(sentence.timestamp!)}
                  title={`Jump to ${formatTime(sentence.timestamp)}`}
                >
                  [{formatTime(sentence.timestamp)}]
                </button>
              )}{' '}
              {sentence.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TranscriptViewer

'use client'
import { useRef } from 'react'
import type { Project } from './FLFTranscriptsPage'

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const VideoProject = ({ project }: { project: Project }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleTimestampClick = (timestamp: number) => {
    if (iframeRef.current) {
      const startTime = Math.floor(timestamp)
      iframeRef.current.src = `https://www.youtube.com/embed/${project.videoId}?start=${startTime}&autoplay=1`
    }
  }

  return (
    <div className="video-project">
      <div className="project-row">
        <div className="video-container">
          <iframe
            ref={iframeRef}
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${project.videoId}`}
            title={project.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="summary-container">
          <div className="video-number">#{project.number}</div>
          <h2 className="video-title">{project.title}</h2>
          <div className="video-speaker">{project.speaker}</div>
          <div className="video-summary">{project.summary}</div>
        </div>
      </div>
      {project.hasTranscript && (
        <div className="transcript-container">
          <h3 className="transcript-title">Complete Transcript</h3>
          {project.transcriptWithTimestamps && project.transcriptWithTimestamps.length > 0 ? (
            <div className="transcript-text">
              {project.transcriptWithTimestamps.map((entry, index) => (
                <span key={index} className="transcript-entry">
                  <button
                    className="timestamp-link"
                    onClick={() => handleTimestampClick(entry.start)}
                    title={`Jump to ${formatTime(entry.start)}`}
                  >
                    [{formatTime(entry.start)}]
                  </button>
                  {' '}
                  {entry.text}{' '}
                </span>
              ))}
            </div>
          ) : (
            <div className="transcript-text">{project.transcript}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoProject

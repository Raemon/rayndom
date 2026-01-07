'use client'
import { useRef } from 'react'
import type { Project } from './FLFTranscriptsPage'
import TranscriptViewer from './TranscriptViewer'

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
          {project.hasTranscript && (
            <TranscriptViewer
              transcriptWithTimestamps={project.transcriptWithTimestamps}
              transcript={project.transcript}
              onTimestampClick={handleTimestampClick}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoProject

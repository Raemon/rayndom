'use client'
import { useState, useEffect } from 'react'
import VideoProject from './VideoProject'
import './flf-transcripts.css'
import summariesData from './summaries.json'
import transcriptsData from './transcripts.json'

type TranscriptEntry = { start: number; text: string }

export type Project = {
  number: number
  title: string
  speaker: string
  videoId: string
  summary: string
  transcript: string
  transcriptWithTimestamps: TranscriptEntry[]
  hasTranscript: boolean
}

const videoData = [
  { number: 1, title: "Economic Democracy and Worker Cooperatives", speaker: "Ben Sclaroff", videoId: "20yWMxAx6QI" },
  { number: 2, title: "Epistemic Evaluations and Reward Hacking", speaker: "Alejandro Botas", videoId: "6CVBHgyo-V0" },
  { number: 3, title: "Coordination Technology Demo", speaker: "Pivotal Team (Anand Shah, Parker Whitfill, Kai Sandbrink, Ben Sclaroff)", videoId: "9lX6cwiw0Ac" },
  { number: 4, title: "Subjective Reasoning Scaffold Tool", speaker: "Vaughn Tan", videoId: "ErYC-F7lJac" },
  { number: 5, title: "Polis 2.0: Collective Response System", speaker: "Steve Isley", videoId: "EzVN2IJhP7Q" },
  { number: 6, title: "Orchestrated Communication with Chord", speaker: "Blake Borgeson", videoId: "IkwKzNl6J-g" },
  { number: 7, title: "Evidentiary: AI for Trust and Safety Compliance", speaker: "Agita Pasaribu", videoId: "NOYGvoB3pk4" },
  { number: 8, title: "AI Supervised Deliberation Markets", speaker: "Siddarth Srinivasan", videoId: "OA-nLfXV7Ks" },
  { number: 9, title: "Collective Agency and Group Collaboration Tools", speaker: "Paul de Font-Réaulx", videoId: "P_uMaOzBH_Q" },
  { number: 10, title: "AI for the Epistemic Commons", speaker: "Herbie Bradley", videoId: "Q-2Ci4Ajmh8" },
  { number: 11, title: "Deliberation Bench", speaker: "Martin Ciesielski-Listwan, Luke Hewitt, Paul de Font-Réaulx", videoId: "T3JAWlc1dq0" },
  { number: 12, title: "Virtuous: Evaluations for Complex Normative Behaviors", speaker: "Alex Bleakley", videoId: "TZSCkqxl8q8" },
  { number: 13, title: "Waymark Labs: AI-Powered Strategic Foresight", speaker: "Alex Bleakley & Emma Kumleben", videoId: "_xtHcBQGYpE" },
  { number: 14, title: "Negotiation Station: Benchmark for AI-Mediated Negotiations", speaker: "Kai Sandbrink", videoId: "eHxQRoE3MmA" },
  { number: 15, title: "AI Fact Checker for Community Notes", speaker: "Steve Isley", videoId: "jqss-3RYjaE" },
  { number: 16, title: "Future Visions Hub: World Building Platform", speaker: "Sofia Vanhanen", videoId: "lCqQIabLKVo" },
  { number: 17, title: "Image Epistemics & RiskWatch", speaker: "Alysia Jovellanos & Martin Ciesielski-Listwan", videoId: "m5h8Sx8kx18" },
  { number: 18, title: "Agent Prediction Strategies & Cheap Gradability", speaker: "Alex Bleakley", videoId: "qkvFfS_nTI8" },
  { number: 19, title: "Deep Future: AI Agent for Scenario Planning", speaker: "Gordon Brander", videoId: "r_vdUeoKbJE" },
  { number: 20, title: "MVP Experiments: Offers & Asks, Digital Twins, Sealed, EA Global Matcher", speaker: "Matt Brooks", videoId: "uX3EdKWo3ZA" },
  { number: 21, title: "AI Discourse Sensemaking: In-Group & Out-Group Analysis", speaker: "Matt Brooks & Niki Dupuis", videoId: "vqDRlSWTOUQ" }
]

const FLFTranscriptsPage = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const combined = videoData.map(video => {
      const summary = summariesData.find((s: { video_id: string }) => s.video_id === video.videoId)
      const transcript = transcriptsData.find((t: { video_id: string }) => t.video_id === video.videoId)
      return {
        ...video,
        summary: (summary as { summary?: string })?.summary || '',
        transcript: (transcript as { transcript?: string })?.transcript || '',
        transcriptWithTimestamps: (transcript as { transcript_with_timestamps?: TranscriptEntry[] })?.transcript_with_timestamps || [],
        hasTranscript: (transcript as { success?: boolean })?.success === true
      }
    })
    setProjects(combined)
  }, [])

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.summary.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flf-app">
      <header className="flf-header">
        <h1>AI for Human Reasoning Fellowship</h1>
        <p>Video Transcript Summaries</p>
        <p className="channel-link">
          <a href="https://www.youtube.com/@FLFoundation" target="_blank" rel="noopener noreferrer">
            View YouTube Channel →
          </a>
        </p>
      </header>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search videos by speaker, title, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="projects-container">
        {filteredProjects.length === 0 ? (
          <div className="no-results">Loading projects...</div>
        ) : (
          filteredProjects.map(project => (
            <VideoProject key={project.videoId} project={project} />
          ))
        )}
      </div>
      <footer className="flf-footer">
        <p>Source: <a href="https://aiforhumanreasoning.com/#fellowship" target="_blank" rel="noopener noreferrer">aiforhumanreasoning.com</a></p>
        <p>
          <a href="https://www.youtube.com/@FLFoundation" target="_blank" rel="noopener noreferrer">
            📺 Subscribe to FLF YouTube Channel
          </a>
        </p>
        <p>All transcripts retrieved using youtube-transcript-api</p>
      </footer>
    </div>
  )
}

export default FLFTranscriptsPage

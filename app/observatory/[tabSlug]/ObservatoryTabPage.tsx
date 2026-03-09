'use client'
import { useCallback, useEffect, useState } from 'react'
import ObservatoryPage from '../ObservatoryPage'
import { StoryCard } from '../hackerNewsTypes'
import { Tab } from '../constants'

type JobSummary = {
  queuedCount: number
  runningCount: number
  latestJobs: { id: number, jobType: string, status: string, error: string | null, createdAt: string }[]
}

const ObservatoryTabPage = ({ activeTab }:{ activeTab: Tab }) => {
  const [cards, setCards] = useState<StoryCard[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [jobSummary, setJobSummary] = useState<JobSummary | null>(null)
  const [error, setError] = useState('')
  const loadCards = useCallback(async () => {
    setError('')
    try {
      const response = await fetch(`/api/observatory/feed?tab=${activeTab}`, { cache: 'no-store' })
      const data = await response.json() as { cards?: StoryCard[], error?: string }
      if (!response.ok) throw new Error(data.error || 'Failed to load feed')
      setCards(data.cards || [])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }, [activeTab])
  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/observatory/jobs', { cache: 'no-store' })
      const data = await response.json() as JobSummary
      if (response.ok) setJobSummary(data)
    } catch {}
  }, [])
  useEffect(() => {
    setLoading(true)
    void loadCards()
    void loadJobs()
  }, [activeTab, loadCards, loadJobs])
  useEffect(() => {
    if (!jobSummary || (!jobSummary.queuedCount && !jobSummary.runningCount)) return
    const interval = window.setInterval(() => {
      void loadJobs()
      void loadCards()
    }, 3000)
    return () => window.clearInterval(interval)
  }, [jobSummary, loadCards, loadJobs])
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setError('')
    try {
      const response = await fetch('/api/observatory/refresh', { method: 'POST' })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Failed to refresh Observatory')
      await Promise.all([loadJobs(), loadCards()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to refresh Observatory')
    } finally {
      setRefreshing(false)
    }
  }, [loadCards, loadJobs])
  return <ObservatoryPage activeTab={activeTab} cards={cards} loading={loading} refreshing={refreshing} onRefresh={handleRefresh} jobSummary={jobSummary} error={error} />
}

export default ObservatoryTabPage

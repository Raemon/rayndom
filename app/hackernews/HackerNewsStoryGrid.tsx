'use client'

import { useEffect, useMemo, useState } from 'react'
import HackerNewsStoryRow from './HackerNewsStoryRow'
import { StoryCard } from './hackerNewsTypes'

const LOADING_SNIPPET = 'Loading article text...'
const FALLBACK_SNIPPET = 'No readable body text found for this URL.'
const SNIPPET_WORKER_COUNT = 3
const STORIES_PER_ROW = 5

const updateStoryCardSnippet = (cards: StoryCard[], storyId: number, snippet: string, snippetHtml: string) => {
  return cards.map(card => card.id === storyId ? { ...card, snippet, snippetHtml } : card)
}

const fetchStorySnippet = async (storyId: number) => {
  try {
    const response = await fetch(`/api/hackernews/story-snippet?id=${storyId}`, { method: 'GET', cache: 'no-store' })
    if (!response.ok) return { snippet: FALLBACK_SNIPPET, snippetHtml: '' }
    const payload = await response.json() as { snippet?: unknown, snippetHtml?: unknown }
    const snippet = typeof payload.snippet === 'string' && payload.snippet.trim() ? payload.snippet : FALLBACK_SNIPPET
    const snippetHtml = typeof payload.snippetHtml === 'string' ? payload.snippetHtml : ''
    return { snippet, snippetHtml }
  } catch {
    return { snippet: FALLBACK_SNIPPET, snippetHtml: '' }
  }
}

const buildStoryRows = (storyCards: StoryCard[]) => {
  const rows: StoryCard[][] = []
  for (let storyIndex = 0; storyIndex < storyCards.length; storyIndex += STORIES_PER_ROW) {
    rows.push(storyCards.slice(storyIndex, storyIndex + STORIES_PER_ROW))
  }
  return rows
}

const HackerNewsStoryGrid = ({ initialCards }:{ initialCards: StoryCard[] }) => {
  const [cards, setCards] = useState(initialCards)
  const storyIdsToHydrate = useMemo(() => initialCards.filter(card => card.snippet === LOADING_SNIPPET).map(card => card.id), [initialCards])
  const filteredCards = useMemo(() => cards.filter(card => card.snippet !== FALLBACK_SNIPPET), [cards])
  const storyRows = useMemo(() => buildStoryRows(filteredCards), [filteredCards])
  useEffect(() => {
    if (!storyIdsToHydrate.length) return
    let isCancelled = false
    let nextStoryIndex = 0
    const workerCount = Math.min(SNIPPET_WORKER_COUNT, storyIdsToHydrate.length)
    const workerIndexes = Array.from({ length: workerCount }, (_, index) => index)
    const processNextStory = async () => {
      while (!isCancelled) {
        const storyId = storyIdsToHydrate[nextStoryIndex]
        nextStoryIndex += 1
        if (storyId === undefined) return
        const { snippet, snippetHtml } = await fetchStorySnippet(storyId)
        if (isCancelled) return
        setCards(currentCards => updateStoryCardSnippet(currentCards, storyId, snippet, snippetHtml))
      }
    }
    for (const workerIndex of workerIndexes) {
      void workerIndex
      void processNextStory()
    }
    return () => {
      isCancelled = true
    }
  }, [storyIdsToHydrate])
  return (
    <div className="grid gap-y-12 font-[Georgia,serif]">
      {storyRows.map((rowStories, rowIndex) => <HackerNewsStoryRow key={rowStories[0]?.id ?? rowIndex} rowStories={rowStories} rowIndex={rowIndex} />)}
    </div>
  )
}

export default HackerNewsStoryGrid

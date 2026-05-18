'use client'

import { useCallback, useMemo, useState } from 'react'
import HackerNewsStoryRow, { ClickedSide } from './HackerNewsStoryRow'
import { StoryPanel, useStoryPanel } from './StoryPanel'
import { StoryCard } from './hackerNewsTypes'

const FALLBACK_SNIPPET = 'No readable body text found for this URL.'
const STORIES_PER_ROW = 5

const buildStoryRows = (storyCards: StoryCard[]) => {
  const rows: StoryCard[][] = []
  for (let storyIndex = 0; storyIndex < storyCards.length; storyIndex += STORIES_PER_ROW) {
    rows.push(storyCards.slice(storyIndex, storyIndex + STORIES_PER_ROW))
  }
  return rows
}

type ClickState = { rowIndex: number, side: ClickedSide }

const HackerNewsStoryGrid = ({ initialCards }:{ initialCards: StoryCard[] }) => {
  const [clickState, setClickState] = useState<ClickState | null>(null)
  const panel = useStoryPanel()
  const filteredCards = useMemo(() => initialCards.filter(card => card.snippet !== FALLBACK_SNIPPET), [initialCards])
  const storyRows = useMemo(() => buildStoryRows(filteredCards), [filteredCards])
  const handleStoryClick = useCallback((rowIndex: number) => (url: string, side: ClickedSide) => {
    const card = filteredCards.find(c => c.url === url)
    setClickState({ rowIndex, side })
    panel.openPanel(url, card?.iframe === false)
  }, [filteredCards, panel.openPanel])
  return (
    <>
      <StoryPanel {...panel} />
      <div className="grid gap-y-12 font-[Georgia,serif]">
        {storyRows.map((rowStories, rowIndex) => (
          <HackerNewsStoryRow
            key={rowStories[0]?.id ?? rowIndex}
            rowStories={rowStories}
            rowIndex={rowIndex}
            onStoryClick={handleStoryClick(rowIndex)}
            clickedSide={clickState?.rowIndex === rowIndex ? clickState.side : null}
          />
        ))}
      </div>
    </>
  )
}

export default HackerNewsStoryGrid

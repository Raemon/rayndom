import HackerNewsLeadStory from './HackerNewsLeadStory'
import HackerNewsSupportingStory from './HackerNewsSupportingStory'
import { StoryCard } from './hackerNewsTypes'

export type ClickedSide = 'lead' | 'supporting'

const HackerNewsStoryRow = ({ rowStories, rowIndex, onStoryClick, clickedSide }:{ rowStories: StoryCard[], rowIndex: number, onStoryClick?: (url: string, side: ClickedSide) => void, clickedSide?: ClickedSide | null }) => {
  const leadStory = rowStories[0]
  const supportingStories = rowStories.slice(1)
  const isLeadOnLeft = rowIndex % 2 === 0
  if (!leadStory) return null
  const showLead = !clickedSide || clickedSide === 'lead'
  const showSupporting = !clickedSide || clickedSide === 'supporting'
  const leadElement = showLead && <HackerNewsLeadStory leadStory={leadStory} isLeadOnLeft={isLeadOnLeft} onStoryClick={onStoryClick ? (url) => onStoryClick(url, 'lead') : undefined} />
  const supportingElement = showSupporting && (
    <div className="grid grid-cols-2 grid-rows-2 gap-8">
      {supportingStories.map(story => <HackerNewsSupportingStory key={story.id} story={story} onStoryClick={onStoryClick ? (url) => onStoryClick(url, 'supporting') : undefined} />)}
    </div>
  )
  const isSingleColumn = clickedSide != null
  return (
    <section className={`max-w-[1500px] mx-auto grid min-h-[260px] gap-24 ${isSingleColumn ? 'grid-cols-[minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'}`}>
      {isLeadOnLeft ? <>{leadElement}{supportingElement}</> : <>{supportingElement}{leadElement}</>}
    </section>
  )
}

export default HackerNewsStoryRow

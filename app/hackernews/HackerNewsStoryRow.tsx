import HackerNewsLeadStory from './HackerNewsLeadStory'
import HackerNewsSupportingStory from './HackerNewsSupportingStory'
import { StoryCard } from './hackerNewsTypes'

const HackerNewsStoryRow = ({ rowStories, rowIndex }:{ rowStories: StoryCard[], rowIndex: number }) => {
  const leadStory = rowStories[0]
  const supportingStories = rowStories.slice(1)
  const isLeadOnLeft = rowIndex % 2 === 0
  if (!leadStory) return null
  return (
    <section className="max-w-[1500px] mx-auto grid min-h-[260px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-24">
      {isLeadOnLeft && <HackerNewsLeadStory leadStory={leadStory} isLeadOnLeft={true} />}
      <div className="grid grid-cols-2 grid-rows-2 gap-8">
        {supportingStories.map(story => <HackerNewsSupportingStory key={story.id} story={story} />)}
      </div>
      {!isLeadOnLeft && <HackerNewsLeadStory leadStory={leadStory} isLeadOnLeft={false} />}
    </section>
  )
}

export default HackerNewsStoryRow

import fs from 'fs'
import path from 'path'
import HackerNewsStoryGrid from './HackerNewsStoryGrid'
import { StoryCard } from './hackerNewsTypes'

const STORIES_TO_RENDER = 100
const DATA_PATH = path.join(process.cwd(), 'app/observatory/hackerNewsData.json')

const loadStories = (): StoryCard[] => {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) as { stories: StoryCard[] }
  return raw.stories.slice(0, STORIES_TO_RENDER)
}

const HackerNewsPage = () => {
  const cards = loadStories()
  return (
    <main className="min-h-screen bg-[#fffff8] px-3 pt-[10px] pb-3 font-[Georgia,serif] text-[#1f1f1f]">
      <div className="max-w-[1500px] mt-[36px] pb-[36px] mb-[36px] mx-auto text-center border-b-2 border-b-[#3f3f3f]">
        <h1 className="m-0 uppercase text-[42px] mb-3 leading-[0.95] font-medium tracking-[0.5px]">Hacker News</h1>
        <h3 className="m-0 text-[14px] uppercase leading-[1.25] font-medium tracking-[0.5px]">News for nerds. Stuff that matters.</h3>
      </div>
      <HackerNewsStoryGrid initialCards={cards} />
    </main>
  )
}

export default HackerNewsPage

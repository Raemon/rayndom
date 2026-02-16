import { StoryCard } from './hackerNewsTypes'

const HackerNewsSupportingStory = ({ story }:{ story: StoryCard }) => {
  return (
    <article className="px-[10px] py-2">
      <a href={story.url} target="_blank" rel="noreferrer" className="text-[#1a1a1a] no-underline">
        <h3 className={`m-0 ${story.title.length > 90 ? 'text-[20px]' : story.title.length > 30 ? 'text-[24px]' : 'text-[36px]'} leading-[1.25] font-[Georgia,serif] font-medium`}>{story.title}</h3>
      </a>
      <p className="my-2 text-[12px] italic text-[#646464]">{story.domain}</p>
      {story.snippetHtml ? (
        <div
          className="m-0 overflow-hidden whitespace-normal text-[16px] leading-[1.4] [display:-webkit-box] [-webkit-line-clamp:6] [-webkit-box-orient:vertical] [&_a]:text-[#111] [&_a]:no-underline [&_a:visited]:text-[#111] [&_p]:mt-0 [&_p]:mb-[0.8em]"
          dangerouslySetInnerHTML={{ __html: story.snippetHtml }}
        />
      ) : (
        <p className="mb-[0.7em] overflow-hidden whitespace-normal text-[16px] leading-[1.4] [display:-webkit-box] [-webkit-line-clamp:6] [-webkit-box-orient:vertical]">{story.snippet}</p>
      )}
      <p className="mt-2 text-[11px] text-[#747474]">{story.byline}</p>
    </article>
  )
}

export default HackerNewsSupportingStory

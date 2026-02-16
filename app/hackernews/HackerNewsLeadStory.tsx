import { StoryCard } from './hackerNewsTypes'

const HackerNewsLeadStory = ({ leadStory, isLeadOnLeft, onStoryClick }:{ leadStory: StoryCard, isLeadOnLeft: boolean, onStoryClick?: (url: string) => void }) => {
  return (
    <article className={isLeadOnLeft ? 'py-[10px] pr-3' : 'py-[10px] pl-3'}>
      <style>
        {`
          a {
            color: #111;
            text-decoration: none;
          }
          b, strong {
            font-weight: 600;
          }
        `}
      </style>
      <a href={leadStory.url} onClick={onStoryClick ? (e) => { e.preventDefault(); onStoryClick(leadStory.url) } : undefined} target="_blank" rel="noreferrer" className="text-[#111] no-underline cursor-pointer">
        <h2 className={`m-0 ${leadStory.title.length > 90 ? 'text-[30px]' : leadStory.title.length > 30 ? 'text-[36px]' : 'text-[48px]'} leading-[1] font-[Georgia,serif] font-medium`}>{leadStory.title}</h2>
      </a>
      <p className="mt-2 mb-[10px] text-[13px] italic text-[#565656] flex items-center gap-1"><a href={leadStory.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#565656] no-underline"><img src={`https://www.google.com/s2/favicons?domain=${leadStory.domain}&sz=16`} alt="" className="w-3 h-3 saturate-50" />{leadStory.domain}</a></p>
      {leadStory.snippetHtml ? (
        <div
          className="m-0 overflow-hidden whitespace-normal text-[20px] leading-[1.4] [display:-webkit-box] [-webkit-line-clamp:16] [-webkit-box-orient:vertical] [&_a]:text-[#111] [&_a]:no-underline [&_a:visited]:text-[#111] [&_p]:mt-0 [&_p]:mb-[0.8em]"
          dangerouslySetInnerHTML={{ __html: leadStory.snippetHtml }}
        />
      ) : (
        <p className="mb-[0.8em] overflow-hidden whitespace-normal text-[27px] leading-[1.08] [display:-webkit-box] [-webkit-line-clamp:16] [-webkit-box-orient:vertical]">{leadStory.snippet}</p>
      )}
      <p className="mt-[10px] text-[12px] text-[#666]">{leadStory.byline}</p>
      {leadStory.reason && <p className="mt-2 text-[13px] italic text-[#8a6d3b]">{leadStory.reason}</p>}
    </article>
  )
}

export default HackerNewsLeadStory

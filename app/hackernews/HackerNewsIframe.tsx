const HackerNewsIframe = ({ url }:{ url: string }) => {
  return (
    <iframe src={url} className="h-full w-full border-none" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
  )
}

export default HackerNewsIframe

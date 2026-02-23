import ConversationTopicPage from '../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../research/example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('screenpipe-competitors')
  const outputFiles = getOutputFiles('screenpipe-competitors')
  return <ConversationTopicPage domains={domains} topic="screenpipe-competitors" title="Screenpipe Competitors" outputFiles={outputFiles} />
}

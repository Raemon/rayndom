import ConversationTopicPage from '../example/ConversationTopicPage'
import { getDomainsFromDownloads } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('executive-power-expansion')
  return <ConversationTopicPage domains={domains} topic="executive-power-expansion" title="Executive Power Expansion" />
}

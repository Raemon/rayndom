import ConversationTopicPage from '../example/ConversationTopicPage'
import { getDomainsFromDownloads } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('web-search-apis')
  return <ConversationTopicPage domains={domains} topic="web-search-apis" title="Web Search Apis" />
}

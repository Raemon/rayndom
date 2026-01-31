import ConversationTopicPage from '../example/ConversationTopicPage'
import { getDomainsFromDownloads } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('fred-economic-data')
  return <ConversationTopicPage domains={domains} topic="fred-economic-data" title="Fred Economic Data" />
}

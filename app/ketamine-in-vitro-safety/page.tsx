import ConversationTopicPage from '../common/ConversationTopicPage'
import { getDomainsFromDownloads } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('ketamine-in-vitro-safety')
  return <ConversationTopicPage domains={domains} topic="ketamine-in-vitro-safety" title="Ketamine In Vitro Safety" />
}

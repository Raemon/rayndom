import ConversationTopicPage from '../../common/ConversationTopicPage'
import { getDomainsFromDownloads } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('working-memory')
  return <ConversationTopicPage domains={domains} topic="working-memory" title="Working Memory" />
}

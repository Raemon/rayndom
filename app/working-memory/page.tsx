import ConversationTopicPage from '../cast-corrigibility-sequence/ConversationTopicPage'
import { getDomainsFromDownloads } from '../cast-corrigibility-sequence/page'

export default function Page() {
  const domains = getDomainsFromDownloads('working-memory')
  return <ConversationTopicPage domains={domains} topic="working-memory" title="Working Memory" />
}

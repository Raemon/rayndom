import ConversationTopicPage from '../cast-corrigibility-sequence/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../cast-corrigibility-sequence/page'

export default function Page() {
  const domains = getDomainsFromDownloads('web-search-apis')
  const outputFiles = getOutputFiles('web-search-apis')
  return <ConversationTopicPage domains={domains} topic="web-search-apis" title="Web Search Apis" outputFiles={outputFiles} />
}

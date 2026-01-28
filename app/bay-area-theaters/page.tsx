import ConversationTopicPage from '../cast-corrigibility-sequence/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../cast-corrigibility-sequence/page'

export default function Page() {
  const domains = getDomainsFromDownloads('bay-area-theaters')
  const outputFiles = getOutputFiles('bay-area-theaters')
  return <ConversationTopicPage domains={domains} topic="bay-area-theaters" title="Bay Area Theaters" outputFiles={outputFiles} />
}

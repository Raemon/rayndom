import ConversationTopicPage from '../cast-corrigibility-sequence/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../cast-corrigibility-sequence/page'

export default function Page() {
  const domains = getDomainsFromDownloads('essays')
  const outputFiles = getOutputFiles('essays')
  return <ConversationTopicPage domains={domains} topic="essays" title="Essays" outputFiles={outputFiles} />
}

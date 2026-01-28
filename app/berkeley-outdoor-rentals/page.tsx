import ConversationTopicPage from '../cast-corrigibility-sequence/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../cast-corrigibility-sequence/page'

export default function Page() {
  const domains = getDomainsFromDownloads('berkeley-outdoor-rentals')
  const outputFiles = getOutputFiles('berkeley-outdoor-rentals')
  return <ConversationTopicPage domains={domains} topic="berkeley-outdoor-rentals" title="Berkeley Outdoor Rentals" outputFiles={outputFiles} />
}

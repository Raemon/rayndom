import ConversationTopicPage from '../../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('berkeley-outdoor-rentals')
  const outputFiles = getOutputFiles('berkeley-outdoor-rentals')
  return <ConversationTopicPage domains={domains} topic="berkeley-outdoor-rentals" title="Berkeley Outdoor Rentals" outputFiles={outputFiles} />
}

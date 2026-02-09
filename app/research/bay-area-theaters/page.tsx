import ConversationTopicPage from '../../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('bay-area-theaters')
  const outputFiles = getOutputFiles('bay-area-theaters')
  return <ConversationTopicPage domains={domains} topic="bay-area-theaters" title="Bay Area Theaters" outputFiles={outputFiles} />
}

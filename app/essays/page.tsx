import ConversationTopicPage from '../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('essays')
  const outputFiles = getOutputFiles('essays')
  return <ConversationTopicPage domains={domains} topic="essays" title="Essays" outputFiles={outputFiles} />
}

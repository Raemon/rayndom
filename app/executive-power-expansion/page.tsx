import ConversationTopicPage from '../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('executive-power-expansion')
  const outputFiles = getOutputFiles('executive-power-expansion')
  return <ConversationTopicPage domains={domains} topic="executive-power-expansion" title="Executive Power Expansion" outputFiles={outputFiles} />
}

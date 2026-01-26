import ConversationTopicPage from '../cast-corrigibility-sequence/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../cast-corrigibility-sequence/page'

export default function Page() {
  const domains = getDomainsFromDownloads('example')
  const outputFiles = getOutputFiles('example')
  return <ConversationTopicPage domains={domains} topic="example" title="Example" outputFiles={outputFiles} />
}

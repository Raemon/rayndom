import ConversationTopicPage from '../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../research/example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('ai-agent-damages')
  const outputFiles = getOutputFiles('ai-agent-damages')
  return <ConversationTopicPage domains={domains} topic="ai-agent-damages" title="Ai Agent Damages" outputFiles={outputFiles} />
}

import ConversationTopicPage from '../common/ConversationTopicPage'
import { getOutputFiles } from '../research/example/page'

export default function Page() {
  const outputFiles = getOutputFiles('health-log')
  return <ConversationTopicPage domains={[]} topic="health-log" title="Health Log" outputFiles={outputFiles} />
}

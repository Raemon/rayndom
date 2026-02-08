import ConversationTopicPage from '../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('tag-reasons')
  const outputFiles = getOutputFiles('tag-reasons')
  return <ConversationTopicPage domains={domains} topic="tag-reasons" title="Tag Reasons" outputFiles={outputFiles} />
}

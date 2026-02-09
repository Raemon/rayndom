import ConversationTopicPage from '../../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('raemon-posts')
  const outputFiles = getOutputFiles('raemon-posts')
  return <ConversationTopicPage domains={domains} topic="raemon-posts" title="Raemon Posts" outputFiles={outputFiles} />
}

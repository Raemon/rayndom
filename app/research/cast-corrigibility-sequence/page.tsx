import ConversationTopicPage from '../../common/ConversationTopicPage'
import { getDomainsFromDownloads, getOutputFiles } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('cast-corrigibility-sequence')
  const outputFiles = getOutputFiles('cast-corrigibility-sequence')
  return <ConversationTopicPage domains={domains} topic="cast-corrigibility-sequence" title="CAST: Corrigibility as Singular Target" outputFiles={outputFiles} />
}

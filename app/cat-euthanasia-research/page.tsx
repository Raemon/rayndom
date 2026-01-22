import ConversationTopicPage from '../example/ConversationTopicPage'
import { getDomainsFromDownloads } from '../example/page'

export default function Page() {
  const domains = getDomainsFromDownloads('cat-euthanasia-research')
  return <ConversationTopicPage domains={domains} topic="cat-euthanasia-research" title="Cat Euthanasia Research" />
}

import fs from 'fs'
import path from 'path'
import ConversationTopicPage, { DomainInfo } from './ConversationTopicPage'

export function getDomainsFromDownloads(topic: string): DomainInfo[] {
  const downloadsPath = path.join(process.cwd(), 'app', topic, 'downloads')
  if (!fs.existsSync(downloadsPath)) return []
  const entries = fs.readdirSync(downloadsPath, { withFileTypes: true })
  const domainFolders = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'))
  return domainFolders.map(folder => {
    const domainPath = path.join(downloadsPath, folder.name)
    const files = fs.readdirSync(domainPath, { recursive: true })
      .filter((f): f is string => typeof f === 'string' && !f.startsWith('.'))
    return { domain: folder.name, files }
  })
}

export default function Page() {
  const domains = getDomainsFromDownloads('example')
  return <ConversationTopicPage domains={domains} topic="example" title="Example" />
}

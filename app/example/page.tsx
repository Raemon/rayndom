import fs from 'fs'
import path from 'path'
import ConversationTopicPage, { DomainInfo } from '../common/ConversationTopicPage'

export function getDomainsFromDownloads(topic: string): DomainInfo[] {
  const downloadsPath = path.join(process.cwd(), `downloads/${topic}`)
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

export function getOutputFiles(topic: string): string[] {
  const outputsPath = path.join(process.cwd(), `outputs/${topic}`)
  if (!fs.existsSync(outputsPath)) return []
  return fs.readdirSync(outputsPath)
    .filter(f => !f.startsWith('.') && f.endsWith('.csv'))
}

export default function Page() {
  const domains = getDomainsFromDownloads('example')
  const outputFiles = getOutputFiles('example')
  return <ConversationTopicPage domains={domains} topic="example" title="Example" outputFiles={outputFiles} />
}

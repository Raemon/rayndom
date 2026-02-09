import fs from 'fs'
import path from 'path'
import ConversationTopicPage, { DomainInfo } from '../../common/ConversationTopicPage'

export function getDomainsFromDownloads(topic: string): DomainInfo[] {
  const domains: DomainInfo[] = []
  const downloadsPath = path.join(process.cwd(), `downloads/${topic}`)
  if (fs.existsSync(downloadsPath)) {
    const entries = fs.readdirSync(downloadsPath, { withFileTypes: true })
    const domainFolders = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'))
    for (const folder of domainFolders) {
      const domainPath = path.join(downloadsPath, folder.name)
      const files = fs.readdirSync(domainPath, { recursive: true })
        .filter((f): f is string => typeof f === 'string' && !f.startsWith('.'))
      domains.push({ domain: folder.name, files })
    }
  }
  const appOutputPath = path.join(process.cwd(), `app/research/${topic}/output`)
  if (fs.existsSync(appOutputPath)) {
    const entries = fs.readdirSync(appOutputPath, { withFileTypes: true })
    const domainFolders = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'))
    for (const folder of domainFolders) {
      const domainPath = path.join(appOutputPath, folder.name)
      const files = fs.readdirSync(domainPath, { recursive: true })
        .filter((f): f is string => typeof f === 'string' && !f.startsWith('.'))
      domains.push({ domain: folder.name, files })
    }
  }
  return domains
}

export function getOutputFiles(topic: string): string[] {
  const files: string[] = []
  const outputsPath = path.join(process.cwd(), `outputs/${topic}`)
  if (fs.existsSync(outputsPath)) {
    const outputFiles = fs.readdirSync(outputsPath)
      .filter(f => !f.startsWith('.') && f.endsWith('.csv'))
    files.push(...outputFiles)
  }
  const appOutputPath = path.join(process.cwd(), `app/research/${topic}/output`)
  if (fs.existsSync(appOutputPath)) {
    const appOutputFiles = fs.readdirSync(appOutputPath)
      .filter(f => !f.startsWith('.') && f.endsWith('.csv'))
    files.push(...appOutputFiles)
  }
  return files
}

export default function Page() {
  const domains = getDomainsFromDownloads('example')
  const outputFiles = getOutputFiles('example')
  return <ConversationTopicPage domains={domains} topic="example" title="Example" outputFiles={outputFiles} />
}

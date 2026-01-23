'use client'
import { useState, useEffect } from 'react'
import { marked } from 'marked'
import ConversationTopicSiteItem from './ConversationTopicSiteItem'
import MarkdownContent from './MarkdownContent'

export type DomainInfo = {
  domain: string
  files: string[]
}

export type SelectedFile = {
  domain: string
  file: string
  showAsIframe?: boolean
}

type Props = {
  domains: DomainInfo[]
  topic: string
  title?: string
}

const ConversationTopicPage = ({ domains, topic, title }: Props) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (domains.length > 0 && domains[0].files.length > 0) {
      setSelectedFile({ domain: domains[0].domain, file: domains[0].files[0] })
    }
  }, [])

  useEffect(() => {
    if (!selectedFile) {
      setContent(null)
      return
    }
    const ext = selectedFile.file.split('.').pop()?.toLowerCase()
    if (ext === 'md') {
      setLoading(true)
      fetch(`/api/file?topic=${encodeURIComponent(topic)}&domain=${encodeURIComponent(selectedFile.domain)}&file=${encodeURIComponent(selectedFile.file)}`)
        .then(res => res.json())
        .then(data => {
          if (data.type === 'markdown') {
            const renderer = new marked.Renderer()
            renderer.image = () => ''
            setContent(marked.parse(data.content, { renderer }) as string)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [selectedFile])

  const getFileType = (file: string): 'markdown' | 'image' | 'pdf' | 'unknown' => {
    const ext = file.split('.').pop()?.toLowerCase()
    if (ext === 'md') return 'markdown'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image'
    if (ext === 'pdf') return 'pdf'
    return 'unknown'
  }

  const getFileUrl = (domain: string, file: string) => {
    return `/api/file?topic=${encodeURIComponent(topic)}&domain=${encodeURIComponent(domain)}&file=${encodeURIComponent(file)}`
  }

  return (
    <div className="p-5 flex gap-5">
      <div className="w-[300px] flex-shrink-0 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {title && <h1 className="text-lg m-0 mb-3">{title}</h1>}
        <div>
          {domains.map((domainInfo, index) => (
            <ConversationTopicSiteItem
              key={domainInfo.domain}
              domainInfo={domainInfo}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
              initiallyExpanded={index === 0}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 max-w-3xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {selectedFile && (
          <div>
            <div className="mb-2 text-xs text-gray-600">
              {selectedFile.domain}/{selectedFile.file}
              <button onClick={() => setSelectedFile(null)} className="ml-2 cursor-pointer">×</button>
            </div>
            {loading && <div>Loading...</div>}
            {!loading && getFileType(selectedFile.file) === 'markdown' && content && (
              <MarkdownContent html={content} />
            )}
            {!loading && getFileType(selectedFile.file) === 'image' && (
              <img src={getFileUrl(selectedFile.domain, selectedFile.file)} alt={selectedFile.file} className="max-w-full" />
            )}
            {!loading && getFileType(selectedFile.file) === 'pdf' && (
              <iframe src={getFileUrl(selectedFile.domain, selectedFile.file)} className="w-full h-[80vh] border-none" />
            )}
            {selectedFile.showAsIframe && (
              <iframe src={`https://${selectedFile.domain}`} className="w-full h-[80vh] border-none" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationTopicPage

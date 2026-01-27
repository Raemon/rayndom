'use client'
import { useState, useEffect, useMemo } from 'react'
import { marked } from 'marked'
import ConversationTopicSiteItem from './ConversationTopicSiteItem'
import MarkdownContent from './MarkdownContent'
import DetailRowList from '../berkeley-wedding-venues/DetailRowList'
import CsvDataGrid from '../common/CsvDataGrid'

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
  outputFiles?: string[]
}

const parseCsvLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  const lineCharacters = line.split('')
  for (const char of lineCharacters) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

const parseCsvToRows = (csv: string): {columns: string[], rows: Record<string, string>[]} => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length <= 1) return {columns: [], rows: []}
  const headerLine = lines[0]
  const columns = parseCsvLine(headerLine)
  const dataLines = lines.slice(1)
  const rows = dataLines.map((line) => {
    const cols = parseCsvLine(line)
    const row: Record<string, string> = {}
    for (let i = 0; i < columns.length; i++) {
      row[columns[i]] = cols[i] || ''
    }
    return row
  })
  return {columns, rows}
}

const ConversationTopicPage = ({ domains, topic, title, outputFiles = [] }: Props) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(() => {
    if (outputFiles.length > 0) {
      return { domain: '__outputs__', file: outputFiles[0] }
    }
    if (domains.length > 0 && domains[0].files.length > 0) {
      return { domain: domains[0].domain, file: domains[0].files[0] }
    }
    return null
  })
  const [content, setContent] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<{columns: string[], rows: Record<string, string>[]} | null>(null)
  const handleSelectFile = (nextFile: SelectedFile | null) => {
    setSelectedFile(nextFile)
    setContent(null)
    setCsvData(null)
  }

  useEffect(() => {
    if (!selectedFile) {
      return
    }
    const ext = selectedFile.file.split('.').pop()?.toLowerCase()
    const source = selectedFile.domain === '__outputs__' ? 'outputs' : 'downloads'
    if (ext === 'md') {
      fetch(`/api/file?topic=${encodeURIComponent(topic)}&domain=${encodeURIComponent(selectedFile.domain)}&file=${encodeURIComponent(selectedFile.file)}&source=${source}`)
        .then(res => res.json())
        .then(data => {
          if (data.type === 'markdown') {
            const renderer = new marked.Renderer()
            renderer.image = () => ''
            setContent(marked.parse(data.content, { renderer }) as string)
          } else {
            setContent('')
          }
        })
        .catch(() => setContent(''))
    } else if (ext === 'csv') {
      fetch(`/api/file?topic=${encodeURIComponent(topic)}&domain=${encodeURIComponent(selectedFile.domain)}&file=${encodeURIComponent(selectedFile.file)}&source=${source}`)
        .then(res => res.json())
        .then(data => {
          if (data.type === 'csv') {
            const parsed = parseCsvToRows(data.content)
            setCsvData(parsed)
          } else {
            setCsvData({columns: [], rows: []})
          }
        })
        .catch(() => setCsvData({columns: [], rows: []}))
    }
  }, [selectedFile, topic])

  const getFileType = (file: string): 'markdown' | 'image' | 'pdf' | 'csv' | 'unknown' => {
    const ext = file.split('.').pop()?.toLowerCase()
    if (ext === 'md') return 'markdown'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image'
    if (ext === 'pdf') return 'pdf'
    if (ext === 'csv') return 'csv'
    return 'unknown'
  }

  const getFileUrl = (domain: string, file: string) => {
    const source = domain === '__outputs__' ? 'outputs' : 'downloads'
    return `/api/file?topic=${encodeURIComponent(topic)}&domain=${encodeURIComponent(domain)}&file=${encodeURIComponent(file)}&source=${source}`
  }
  const csvRowNameKey = useMemo(() => {
    if (!csvData || csvData.columns.length === 0) return ''
    if (csvData.columns.includes('Name')) return 'Name'
    return csvData.columns[0]
  }, [csvData])
  const isLoading = selectedFile && (
    (getFileType(selectedFile.file) === 'markdown' && content === null) ||
    (getFileType(selectedFile.file) === 'csv' && csvData === null)
  )

  return (
    <div className="p-5 flex gap-5">
      <div className="w-[300px] flex-shrink-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {title && <h1 className="text-lg m-0 mb-3">{title}</h1>}
        {outputFiles.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold m-0 mb-2">Outputs</h2>
            <ul className="m-0 pl-0 text-xs list-none">
              {outputFiles.map(file => {
                const isSelected = selectedFile?.domain === '__outputs__' && selectedFile?.file === file
                return (
                  <li key={file} className="mb-0.5">
                    <span
                      onClick={() => handleSelectFile({ domain: '__outputs__', file })}
                      className={`cursor-pointer ${isSelected ? 'text-white font-bold underline' : 'text-gray-400'}`}
                    >
                      {file}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <div>
          {domains.map((domainInfo, index) => (
            <ConversationTopicSiteItem
              key={domainInfo.domain}
              domainInfo={domainInfo}
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile}
              initiallyExpanded={index === 0}
            />
          ))}
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${selectedFile && getFileType(selectedFile.file) === 'csv' ? '' : 'max-w-3xl'}`}>
        {selectedFile && (
          <div>
            <div className="mb-2 text-gray-200">
              {selectedFile.domain === '__outputs__' ? 'outputs' : selectedFile.domain}/{selectedFile.file}
              <button onClick={() => handleSelectFile(null)} className="ml-2 cursor-pointer">×</button>
            </div>
            {isLoading && <div>Loading...</div>}
            {!isLoading && getFileType(selectedFile.file) === 'markdown' && content && (
              <MarkdownContent html={content} />
            )}
            {!isLoading && getFileType(selectedFile.file) === 'image' && (
              <img src={getFileUrl(selectedFile.domain, selectedFile.file)} alt={selectedFile.file} className="max-w-full" />
            )}
            {getFileType(selectedFile.file) === 'pdf' && (
              <iframe src={`${getFileUrl(selectedFile.domain, selectedFile.file)}#navpanes=0&zoom=93`} className="w-full h-[80vh] border-none" />
            )}
            {!isLoading && getFileType(selectedFile.file) === 'csv' && csvData && (
              <div>
                <div className="text-xs">
                  <CsvDataGrid key={`${selectedFile.domain}/${selectedFile.file}`} columns={csvData.columns} rows={csvData.rows} />
                </div>
                {/* {csvRowNameKey && <DetailRowList rows={csvData.rows} columns={csvData.columns} rowNameKey={csvRowNameKey} />} */}
              </div>
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

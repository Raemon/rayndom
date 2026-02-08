import { useState, useMemo } from 'react'
import { DomainInfo, SelectedFile } from './ConversationTopicPage'

type Props = {
  domainInfo: DomainInfo
  selectedFile: SelectedFile | null
  onSelectFile: (file: SelectedFile | null) => void
  initiallyExpanded?: boolean
}

type FileTreeNode = {
  name: string
  fullPath: string
  children: FileTreeNode[]
  isFile: boolean
}

const buildFileTree = (files: string[]): FileTreeNode[] => {
  const filteredFiles = files.filter(file => {
    for (const otherFile of files) {
      if (otherFile !== file && otherFile.startsWith(file + '/')) {
        return false
      }
    }
    return true
  })
  const root: FileTreeNode[] = []
  const nodeMap = new Map<string, FileTreeNode>()
  for (const file of filteredFiles) {
    const parts = file.split('/')
    let currentPath = ''
    let parentNodes = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      currentPath = currentPath ? `${currentPath}/${part}` : part
      let node = nodeMap.get(currentPath)
      if (!node) {
        node = {
          name: part,
          fullPath: currentPath,
          children: [],
          isFile: isLast
        }
        nodeMap.set(currentPath, node)
        parentNodes.push(node)
      } else {
        node.isFile = node.isFile && isLast
      }
      parentNodes = node.children
    }
  }
  for (const node of nodeMap.values()) {
    if (node.children.length > 0) {
      node.isFile = false
    }
  }
  return root
}

type FileTreeItemProps = {
  node: FileTreeNode
  domain: string
  selectedFile: SelectedFile | null
  onSelectFile: (file: SelectedFile | null) => void
  level?: number
}

const FileTreeItem = ({node, domain, selectedFile, onSelectFile, level = 0}: FileTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isSupported = (file: string) => {
    const ext = file.split('.').pop()?.toLowerCase()
    return ext === 'md' || ext === 'pdf' || ext === 'csv' || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')
  }
  const isSelected = selectedFile?.domain === domain && selectedFile?.file === node.fullPath
  const supported = node.isFile && isSupported(node.fullPath)

  if (node.isFile) {
    return (
      <li className="mb-0.5 flex items-center gap-1" style={{ paddingLeft: `${level * 12}px` }}>
        <svg onClick={() => onSelectFile({ domain, file: node.fullPath, showAsIframe: true })} className="w-3 h-3 cursor-pointer text-gray-500 hover:text-gray-300 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {supported ? (
          <span
            onClick={() => onSelectFile({ domain, file: node.fullPath })}
            className={`cursor-pointer ${isSelected ? 'text-white font-bold underline' : 'text-gray-400'}`}
          >
            {node.name}
          </span>
        ) : (
          <span className="text-gray-500">{node.name}</span>
        )}
      </li>
    )
  }

  return (
    <li className="mb-0.5">
      <h4 className="m-0 mb-0.5 text-xs flex items-center gap-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)} style={{ paddingLeft: `${level * 12}px` }}>
        <svg className={`w-3 h-3 opacity-50 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {node.name}
      </h4>
      {isExpanded && (
        <ul className="m-0 pl-0 text-xs list-none">
          {node.children.map(child => (
            <FileTreeItem
              key={child.fullPath}
              node={child}
              domain={domain}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

const ConversationTopicSiteItem = ({domainInfo, selectedFile, onSelectFile, initiallyExpanded = false}: Props) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)
  const fileTree = useMemo(() => buildFileTree(domainInfo.files), [domainInfo.files])

  return (
    <div className="mb-3">
      <h3 className="m-0 mb-1 text-sm flex items-center gap-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <svg className={`w-3 h-3 opacity-50 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {domainInfo.domain}
      </h3>
      {isExpanded && (
        <ul className="m-0 pl-0 text-xs list-none">
          {fileTree.map(node => (
            <FileTreeItem
              key={node.fullPath}
              node={node}
              domain={domainInfo.domain}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default ConversationTopicSiteItem

import { DomainInfo, SelectedFile } from './ConversationTopicPage'

type Props = {
  domainInfo: DomainInfo
  selectedFile: SelectedFile | null
  onSelectFile: (file: SelectedFile | null) => void
}

const ConversationTopicSiteItem = ({domainInfo, selectedFile, onSelectFile}: Props) => {
  const isSupported = (file: string) => {
    const ext = file.split('.').pop()?.toLowerCase()
    return ext === 'md' || ext === 'pdf' || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')
  }

  return (
    <div className="mb-3">
      <h3 className="m-0 mb-1 text-sm">{domainInfo.domain}</h3>
      <ul className="m-0 pl-4 text-xs">
        {domainInfo.files.map(file => {
          const supported = isSupported(file)
          const isSelected = selectedFile?.domain === domainInfo.domain && selectedFile?.file === file
          return (
            <li key={file} className="mb-0.5 flex items-center gap-1">
              <svg onClick={() => onSelectFile({ domain: domainInfo.domain, file, showAsIframe: true })} className="w-3 h-3 cursor-pointer text-gray-500 hover:text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {supported ? (
                <span
                  onClick={() => onSelectFile({ domain: domainInfo.domain, file })}
                  className={`cursor-pointer ${isSelected ? 'text-white font-bold underline' : 'text-gray-400'}`}
                >
                  {file}
                </span>
              ) : (
                <span className="text-gray-500">{file}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ConversationTopicSiteItem

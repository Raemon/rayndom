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
            <li key={file} className="mb-0.5">
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

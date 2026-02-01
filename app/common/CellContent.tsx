'use client'
import { CellContent as CellContentType } from './cellRenderers'
import ImageCell from './ImageCell'

type Props = {
  content: CellContentType
  cellClampStyle?: React.CSSProperties
  onImageClick: (url: string) => void
}

const CellContent = ({content, cellClampStyle, onImageClick}: Props) => {
  if (content.type === 'images') {
    return <ImageCell urls={content.urls} onImageClick={onImageClick} />
  }
  if (content.type === 'html') {
    return <div className="whitespace-pre-wrap break-words cursor-text" style={cellClampStyle} dangerouslySetInnerHTML={{__html: content.value}} />
  }
  return <div className="whitespace-pre-wrap break-words cursor-text" style={cellClampStyle}>{content.value}</div>
}

export default CellContent

'use client'

const ImageCell = ({urls, onImageClick}:{urls: string[], onImageClick: (url: string) => void}) => {
  if (urls.length === 0) return null
  return (
    <div className="flex gap-1 flex-wrap">
      {urls.map((url, i) => (
        <img key={i} src={url} alt="" className="h-[100px] object-cover cursor-pointer" onClick={() => onImageClick(url)} />
      ))}
    </div>
  )
}

export default ImageCell

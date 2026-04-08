'use client'
type Props = {
  html: string
  className?: string
}
const MarkdownContent = ({ html, className = '' }: Props) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className={`
        font-[family-name:var(--font-lora)] text-white text-[17px] leading-[1.7]
        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mt-8 [&_h1]:mb-3
        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:mt-6 [&_h2]:mb-2
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:mt-5 [&_h3]:mb-2
        [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1
        [&_p]:my-3
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
        [&_li]:my-1.5
        [&_a]:text-blue-300 [&_a]:underline hover:[&_a]:text-blue-200
        [&_blockquote]:border-l-4 [&_blockquote]:border-gray-500 [&_blockquote]:pl-4 [&_blockquote]:not-italic [&_blockquote]:my-3 [&_blockquote]:text-gray-300
        [&_code]:bg-white/10 [&_code]:text-gray-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
        [&_pre]:bg-white/5 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-3
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_hr]:my-6 [&_hr]:border-gray-600
        [&_table]:border-collapse [&_table]:w-full [&_table]:my-3 [&_table]:text-xs
        [&_th]:border [&_th]:border-gray-600 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-800 [&_th]:text-left
        [&_td]:border [&_td]:border-gray-700 [&_td]:px-3 [&_td]:py-2
        [&_strong]:font-bold
        [&_em]:italic
        [&_img]:max-w-full [&_img]:my-3 [&_img]:rounded
        ${className}
      `}
    />
  )
}
export default MarkdownContent

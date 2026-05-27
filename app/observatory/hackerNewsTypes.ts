export type StoryCard = {
  id: string
  title: string
  url: string
  domain: string
  byline: string | null
  points: number | null
  commentCount: number | null
  snippet: string
  snippetHtml?: string
  reason?: string
  relevance?: number
  postedAt?: string
  importedAt?: string
  iframe?: boolean
}

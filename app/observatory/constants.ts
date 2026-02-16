export type Tab = 'hackernews' | 'lw' | 'arxiv' | 'foryou'

export const TABS: { key: Tab, label: string, title: string, subtitle: string }[] = [
  { key: 'foryou', label: 'For You', title: 'For You', subtitle: 'Curated stories matching your interests.' },
  { key: 'hackernews', label: 'Hacker News', title: 'Hacker News', subtitle: 'News for nerds. Stuff that matters.' },
  { key: 'lw', label: 'LW', title: 'LessWrong', subtitle: 'Refining the art of human rationality.' },
  { key: 'arxiv', label: 'arXiv', title: 'arXiv', subtitle: 'CS: AI · ML · Computation & Language' },
]

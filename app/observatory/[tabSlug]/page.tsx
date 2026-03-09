import { notFound } from 'next/navigation'
import { TABS } from '../constants'
import ObservatoryTabPage from './ObservatoryTabPage'

export default async function Page({ params }: { params: Promise<{ tabSlug: string }> }) {
  const { tabSlug } = await params
  const tab = TABS.find(t => t.key === tabSlug)
  if (!tab) return notFound()
  return <ObservatoryTabPage activeTab={tab.key} />
}

import CatEolResearchPage from './CatEolResearchPage'

export default async function Page({searchParams}: {searchParams: Promise<{provider?: string}>}) {
  const params = await searchParams
  return <CatEolResearchPage searchParams={params} />
}

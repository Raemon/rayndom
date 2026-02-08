'use client'
import { useState, useEffect } from 'react'

type CreditsData = {
  data?: {
    total_credits?: number
    total_usage?: number
  }
  error?: string
}

type ActivityItem = {
  date: string
  model: string
  model_permaslug?: string
  endpoint_id?: string
  provider_name?: string
  usage: number
  byok_usage_inference?: number
  requests: number
  prompt_tokens?: number
  completion_tokens?: number
  reasoning_tokens?: number
}

type ActivityData = {
  data?: ActivityItem[]
  error?: string
}

type DayBreakdown = {
  date: string
  totalCost: number
  models: Array<{
    model: string
    provider_name?: string
    cost: number
    requests: number
    prompt_tokens: number
    completion_tokens: number
    reasoning_tokens: number
    byokUsage: number
  }>
}

const OpenRouterPage = () => {
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [creditsError, setCreditsError] = useState<string | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setCreditsError(null)
      setActivityError(null)
      const [creditsResult, activityResult] = await Promise.allSettled([
        fetch('/api/openrouter/credits').then(res => res.json()),
        fetch('/api/openrouter/activity').then(res => res.json())
      ])
      if (creditsResult.status === 'fulfilled') {
        const creditsData: CreditsData = creditsResult.value
        if (creditsData.error) {
          setCreditsError(creditsData.error)
        } else {
          setCredits(creditsData)
        }
      } else {
        setCreditsError(creditsResult.reason instanceof Error ? creditsResult.reason.message : 'Failed to fetch credits')
      }
      if (activityResult.status === 'fulfilled') {
        const activityData: ActivityData = activityResult.value
        if (activityData.error) {
          setActivityError(activityData.error)
        } else {
          setActivity(activityData)
        }
      } else {
        setActivityError(activityResult.reason instanceof Error ? activityResult.reason.message : 'Failed to fetch activity')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const remainingCredits = credits?.data?.total_credits && credits?.data?.total_usage
    ? credits.data.total_credits - credits.data.total_usage
    : null

  const dailyBreakdown = activity?.data ? (() => {
    const breakdownByDate: Record<string, DayBreakdown> = {}
    for (const item of activity.data) {
      if (!breakdownByDate[item.date]) {
        breakdownByDate[item.date] = {
          date: item.date,
          totalCost: 0,
          models: []
        }
      }
      breakdownByDate[item.date].totalCost += item.usage
      const existingModel = breakdownByDate[item.date].models.find(m => m.model === item.model)
      if (existingModel) {
        existingModel.cost += item.usage
        existingModel.requests += item.requests
        existingModel.prompt_tokens += item.prompt_tokens || 0
        existingModel.completion_tokens += item.completion_tokens || 0
        existingModel.reasoning_tokens += item.reasoning_tokens || 0
        existingModel.byokUsage += item.byok_usage_inference || 0
      } else {
        breakdownByDate[item.date].models.push({
          model: item.model,
          provider_name: item.provider_name,
          cost: item.usage,
          requests: item.requests,
          prompt_tokens: item.prompt_tokens || 0,
          completion_tokens: item.completion_tokens || 0,
          reasoning_tokens: item.reasoning_tokens || 0,
          byokUsage: item.byok_usage_inference || 0
        })
      }
    }
    return Object.values(breakdownByDate)
      .map(day => ({
        ...day,
        models: day.models.sort((a, b) => b.cost - a.cost)
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  })() : []

  if (loading) {
    return (
      <div className="p-4 text-sm text-white">
        <h1 className="text-lg mb-4">OpenRouter Credits & Spending</h1>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 text-sm text-white">
      <h1 className="text-lg mb-4">OpenRouter Credits & Spending</h1>
      {creditsError && <div className="text-red-400 mb-4">Credits Error: {creditsError}</div>}
      {credits?.data && (
        <div className="mb-6">
          <div className="mb-2">
            <span className="text-gray-400">Total Credits: </span>
            <span>{credits.data.total_credits?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400">Total Usage: </span>
            <span>{credits.data.total_usage?.toFixed(2) || 'N/A'}</span>
          </div>
          {remainingCredits !== null && (
            <div className="mb-2">
              <span className="text-gray-400">Remaining Credits: </span>
              <span className={remainingCredits < 10 ? 'text-red-400' : ''}>{remainingCredits.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
      {activityError && <div className="text-yellow-400 mb-4 text-xs">Activity data unavailable: {activityError}. Make sure your API key has analytics permissions.</div>}
      {dailyBreakdown.length > 0 && (
        <div>
          <h2 className="text-base mb-2">Daily Spending</h2>
          <div className="space-y-3">
            {dailyBreakdown.map(day => (
              <div key={day.date} className="text-xs">
                <div className="mb-1">
                  <span className="text-gray-400">{day.date.split('-')[2]}</span>
                  <span className="ml-2">${day.totalCost.toFixed(2)}</span>
                </div>
                {day.models.map(model => (
                  <div key={model.model} className="ml-4 mb-1 text-gray-500">
                    <span>{model.model}</span>
                    {model.provider_name && <span className="ml-1">({model.provider_name})</span>}
                    <span className="ml-2">${model.cost.toFixed(2)}</span>
                    <span className="ml-2">{model.requests} requests</span>
                    {model.prompt_tokens > 0 && <span className="ml-2">{model.prompt_tokens.toLocaleString()} prompt</span>}
                    {model.completion_tokens > 0 && <span className="ml-2">{model.completion_tokens.toLocaleString()} completion</span>}
                    {model.reasoning_tokens > 0 && <span className="ml-2">{model.reasoning_tokens.toLocaleString()} reasoning</span>}
                    {model.byokUsage > 0 && <span className="ml-2">${model.byokUsage.toFixed(2)} BYOK</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {!activityError && !loading && dailyBreakdown.length === 0 && activity && (
        <div className="text-gray-400 text-xs">No spending data available for the last 30 days.</div>
      )}
    </div>
  )
}

export default OpenRouterPage

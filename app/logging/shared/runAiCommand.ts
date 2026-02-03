export const defaultRunAiPrompt = 'Analyze my activity and suggest appropriate tags.'

type RunAiCommandArgs = {
  datetime: string
  prompt?: string
}

type TagsResult = {
  predictions: { type: string, name: string, reason?: string }[]
  createdInstances: unknown[]
  keylogCount: number
  aiNotes: string | null
}

type RunAiCommandResult = {
  tagsResult: TagsResult | null
  questionsResult: { aiNotes: string | null } | null
}

export const runAiCommand = async ({ datetime }: RunAiCommandArgs): Promise<RunAiCommandResult> => {
  let tagsResult: TagsResult | null = null
  try {
    const res = await fetch('/api/timer/predict-tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datetime }) })
    if (res.ok) {
      tagsResult = await res.json()
    }
  } catch {
    // Tags prediction is optional
  }
  return { tagsResult, questionsResult: tagsResult ? { aiNotes: tagsResult.aiNotes } : null }
}

// The default user-editable AI Notes prompt template.
// Placeholders {{keylogText}} / {{screenshotSummariesText}} / {{openRouterBalance}} are
// replaced server-side at request time before being sent to the LLM.
// This is the literal text seeded into the prompts table for new users so that the prior
// hardcoded behavior of `getAiNotesPrompt` is preserved as one selectable Prompt entry.

import { IGNORE_NSFW_CONTENT } from './aiNotesPrompt'

export const DEFAULT_AI_NOTES_PROMPT_TITLE = '15 minute review'

export const DEFAULT_AI_NOTES_PROMPT_TEXT = `You are analyzing recent keylogs and screenshot summaries.

Here are the keylogs:
{{keylogText}}

Here are screenshot summaries:
{{screenshotSummariesText}}

Please think to yourself (but do not say) what you think my goal is write now. (Use the entire keylog and screenshot summaries to determine the goal, then the last 15 minutes worth to determine the specific task I'm working on.) 

Then, think to yourself (but do not say) 3 useful facts I might want to know that are relevant to my goals, that are non-obvious, non-101 level. Then, think about 3 useful facts _related to any of the first facts_, not directly related to my goal (i.e. 1-2 steps out away from directly relevant).

Then say the fact you think is most useful. If you cannot find any useful facts that are not obvious, preface the fact with "No useful facts found, but best guess is: " and then say the fact. If it looks like I solved the problem that the fact was meant to help with, preface the fact with "Probably already solved, but: " and then say the fact. (err on the side of giving the preface if you're not sure if the fact is useful.)

Focus on hard science facts or empirical results or specific tools, not vague concepts or arguments.

Do not give any preamble to the fact.

After the fact, list one short bullet for each of the 15 minutes describing what I did that minute. Don't mention the application name, instead list the project name, and what subtask I seemed to be working.

${IGNORE_NSFW_CONTENT}

OpenRouter balance remaining: {{openRouterBalance}}
`

export const renderPromptTemplate = (template: string, vars: Record<string, string>) => {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(`{{${key}}}`).join(value)
  }
  return result
}

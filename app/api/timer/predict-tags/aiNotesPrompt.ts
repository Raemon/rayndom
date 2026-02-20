export const getOverallStoryPrompt = ({ keylogText, screenshotSummariesText }:{ keylogText?: string, screenshotSummariesText?: string }) => `You are analyzing keylogs and/or screenshot summaries from the past hour to determine what the user was overall doing during the last 15 minutes.
${keylogText ? `\nHere are keylogs:\n${keylogText}\n` : ''}${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}

Review the keylogs and screenshot summaries and write your guess for an overall story of what the user was doing during the last 15 minutes.

Respond with ONLY a JSON object:
{
"overallStory": "write your guess for an overall story of what the user was doing during the last 15 minutes."
}`

type PredictSingleTagResult = {
  whyItMightApply: string
  whyItMightNotApply: string
  confidence: 'low' | 'medium' | 'high'
  decision: boolean
}

type PredictSingleTagPrompt = {
  overallStory: string
  tagType: string
  tagName: string
  tagDescription: string | null
  allTags: { type: string, name: string, description: string | null }[]
}

export const getPredictSingleTagPrompt = ({ overallStory, tagType, tagName, tagDescription, allTags }: PredictSingleTagPrompt): string => `You are analyzing whether a specific tag applies to a time period.

Overall story of what the user was doing during the last 15 minutes:
${overallStory}

Tag type: ${tagType}
Tag name: ${tagName}
${tagDescription ? `\nTag description: ${tagDescription}` : ''}

This tag was designed to capture a particular project, habit-trigger, or technique. Your goal is to figure out whether this tag applies. Most tags do not apply – they were designed to mean a very specific thing.

Look at the tag description and the overall story to determine whether this tag applies. Return the following json:

Respond with ONLY a JSON object:
{
"whyItMightApply": "explain why this tag might apply (broken into multiple paragraphs for readability)."
"whyItMightNotApply": "explain why this tag might not apply (broken into multiple paragraphs for readability)."
"confidence": "how confident are you in your answer? (low confidence), (medium confidence), or (high confidence)."
"decision": boolean value indicating whether this tag applies.
}`

type PredictTagsByTypePrompt = {
  overallStory: string
  tagType: string
  tags: { name: string, description: string | null }[]
}

export const getPredictTagsByTypePrompt = ({ overallStory, tagType, tags }: PredictTagsByTypePrompt): string => `You are analyzing whether tags of type "${tagType}" apply to a time period.

Overall story of what the user was doing during the last 15 minutes:
${overallStory}

Here are the tags of type "${tagType}". For each tag, decide whether it applies based on the tag's description and the overall story. Most tags will NOT apply – they were designed to mean a very specific thing.

Tags:
${tags.map(t => `- "${t.name}"${t.description ? `\n  Description: ${t.description}` : ''}`).join('\n')}

For each tag, consider its description carefully. If the description specifies particular conditions, use those as the deciding criteria. If a tag has no description, use the tag name and type to make your best guess.

Respond with ONLY a JSON object where keys are the exact tag names and values are objects with "applies" (boolean) and "reason" (string explaining why):
{
${tags.map(t => `  "${t.name}": { "applies": false, "reason": "..." }`).join(',\n')}
}`

export const getAiNotesPrompt = ({ keylogText, screenshotSummariesText = '', openRouterBalance }:{ keylogText: string, screenshotSummariesText?: string, openRouterBalance?: string }) => `You are analyzing recent keylogs and screenshot summaries.

Here are the keylogs:
${keylogText}
${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}

Please think to yourself (but do not say) what you think my goal is write now. (Use the entire keylog and screenshot summaries to determine the goal, then the last 15 minutes worth to determine the specific task I'm working on.) 

Then, think to yourself (but do not say) 3 useful facts I might want to know that are relevant to my goals, that are non-obvious, non-101 level. Then, think about 3 useful facts _related to any of the first facts_, not directly related to my goal (i.e. 1-2 steps out away from directly relevant).

Then say the fact you think is most useful. If you cannot find any useful facts that are not obvious, preface the fact with "No useful facts found, but best guess is: " and then say the fact. If it looks like I solved the problem that the fact was meant to help with, preface the fact with "Probably already solved, but: " and then say the fact. (err on the side of giving the preface if you're not sure if the fact is useful.)

Focus on hard science facts or empirical results or specific tools, not vague concepts or arguments.

Do not give any preamble to the fact.

After the fact, list one short bullet for each of the 15 minutes describing what I did that minute. Don't mention the application name, instead list the project name, and what subtask I seemed to be working.
${openRouterBalance ? `\nOpenRouter balance remaining: ${openRouterBalance}` : ''}
`
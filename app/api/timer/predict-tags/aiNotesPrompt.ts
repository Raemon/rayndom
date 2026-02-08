export const getPredictSingleTagPrompt = ({ keylogText, screenshotSummariesText, tagType, tagName, tagDescription, allTags }:{ keylogText?: string, screenshotSummariesText?: string, tagType: string, tagName: string, tagDescription: string | null, allTags: { type: string, name: string, description: string | null }[] }) => `You are analyzing keylogs and/or screenshot summaries from the past hour to determine if a specific tag applies to this time period.
${keylogText ? `\nHere are keylogs:\n${keylogText}\n` : ''}${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}
Tag type: ${tagType}
Tag name: ${tagName}
${tagDescription && `\nTag description: ${tagDescription}`}

List of all other tags and their descriptions:
${allTags.filter(t => !(t.type === tagType && t.name === tagName)).map(t => `- [${t.type}] ${t.name}${t.description ? `: ${t.description}` : ''}`).join('\n')}


This tag was designed to capture a particular project, habit-trigger, or technique. Your goal is to figure out what the user was overall doing during the last 15 minutes. Then, figure out whether this tag applies. Most tags do not apply – they were designed to mean a very specific thing.

Write your guess for what this specific tag means. How would you distinguish whether this tag applies, compared to all the other tags of the same type?

Then, review the keylogs and screenshot summaries and write your guess for an overall story of what the user was doing during the last 15 minutes.

Then, answer the question: was the user in one of the rare situations where this tag applies?

Respond with ONLY a JSON object:
{
"howDistinguish": "write exactly what this tag is for and how you would distinguish it from similar tags or situations".
"overallStory": "write your guess for an overall story of what the user was doing during the last 15 minutes."
"whyItMightApply": "explain why this tag might apply."
"whyItMightNotApply": "explain why this tag might not apply."
"confidence": "how confident are you in your answer? (low confidence), (medium confidence), or (high confidence)."
"decision": boolean value indicating whether this tag applies.
}`

export const getAiNotesPrompt = ({ keylogText, screenshotSummariesText = '' }:{ keylogText: string, screenshotSummariesText?: string }) => `You are analyzing recent keylogs and screenshot summaries.

Here are the keylogs:
${keylogText}
${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}

Please think to yourself (but do not say) what you think my goal is write now. (Use the entire keylog and screenshot summaries to determine the goal, then the last 15 minutes worth to determine the specific task I'm working on.) 

Then, think to yourself (but do not say) 3 useful facts I might want to know that are relevant to my goals, that are non-obvious, non-101 level. Then, think about 3 useful facts _related to any of the first facts_, not directly related to my goal (i.e. 1-2 steps out away from directly relevant).

Then say the fact you think is most useful. If you cannot find any useful facts that are not obvious, preface the fact with "No useful facts found, but best guess is: " and then say the fact. If it looks like I solved the problem that the fact was meant to help with, preface the fact with "Probably already solved, but: " and then say the fact. (err on the side of giving the preface if you're not sure if the fact is useful.)

Focus on hard science facts or empirical results or specific tools, not vague concepts or arguments.

Do not give any preamble to the fact.

After the fact, list one short bullet for each of the 15 minutes describing what I did that minute. Don't mention the application name, instead list the project name, and what subtask I seemed to be working.
`
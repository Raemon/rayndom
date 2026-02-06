export const getPredictTagsPrompt = ({ keylogText, screenshotSummariesText, tagTypesDescription }:{ keylogText?: string, screenshotSummariesText?: string, tagTypesDescription: string }) => `You are analyzing keylogs and/or screenshot summaries from the past hour to determine which tags apply to this time period.
${keylogText ? `\nHere are keylogs:\n${keylogText}\n` : ''}${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}Here are the available tag types and their possible values (with descriptions where available):
${tagTypesDescription}

For each tag, decide whether it doesn't apply at all, _might_ apply (low confidence), probably applies, or highly likely applies. Be fairly liberal with _might_ apply, but extremely conservative with "highly likely applies".

Use the tag description to heavily inform your decision. If it specifies rules, follow them.

Consider whether a given tag is the _best_ tag for the time period, or if there are other tags that might apply more appropriately. 

For each tag, provide a brief reason explaining why you chose it. The reason should be 1-2 sentences and must end with your confidence level in parentheses: (high confidence), (medium confidence), or (low confidence).

Respond with ONLY a JSON array of objects with the format:
[{"type": "tagType", "name": "tagName", "reason": "Brief explanation of why this tag applies. (high confidence)"}, ...]

Example: [{"type": "activity", "name": "coding", "reason": "User was writing TypeScript code in VS Code based on keylog patterns. (high confidence)"}, {"type": "project", "name": "timer-app", "reason": "References to timer-related files suggest work on the timer project. (medium confidence)"}]

Your response must be valid JSON and nothing else.`

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
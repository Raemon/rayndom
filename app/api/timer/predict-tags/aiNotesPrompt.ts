export const getAiNotesPrompt = ({ keylogText, screenshotSummariesText = '' }:{ keylogText: string, screenshotSummariesText?: string }) => `You are analyzing recent keylogs and screenshot summaries.

Here are the keylogs:
${keylogText}
${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}

Please think to yourself (but do not say) what you think my goal is write now. (Use the entire keylog and screenshot summaries to determine the goal, then the last 15 minutes worth to determine the specific task I'm working on.) 

Then, think to yourself (but do not say) 10 useful facts I might want to know that are relevant to my goals, that are non-obvious, non-101 level. Then say the fact you think is most useful. If you cannot find any useful facts that are not obvious, say "No useful facts found".

Remember, do not say anything except the one fact (no preamble or explanation)
`
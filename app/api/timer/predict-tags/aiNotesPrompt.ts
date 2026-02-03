export const getAiNotesPrompt = ({ keylogText, screenshotSummariesText = '' }:{ keylogText: string, screenshotSummariesText?: string }) => `You are analyzing keylogs from the past 15 minutes.

Here are the keylogs:
${keylogText}
${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}
Please think to yourself (but do not say) what you think my goal is write now.

Then, think to yourself (but do not say) 10 ideas for empirical questions I could ask that'd help me achieve my goal.

Then, rank those questions from most to least likely to be useful. Then return them in order from most to least useful.
`
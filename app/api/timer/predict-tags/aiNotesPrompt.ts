export const getAiNotesPrompt = ({ keylogText, screenshotSummariesText = '' }:{ keylogText: string, screenshotSummariesText?: string }) => `You are analyzing keylogs from the past 15 minutes.

Here are the keylogs:
${keylogText}
${screenshotSummariesText ? `\nHere are screenshot summaries:\n${screenshotSummariesText}\n` : ''}
Please think to yourself (but do not say) what you think my goal is write now.

Then, think to yourself (but do not say) 10 useful facts I might want to know that are relevant to my goals. Then say the fact you think is most useful.
`
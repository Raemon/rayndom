export const getAiNotesPrompt = ({ keylogText }:{ keylogText: string }) => `You are analyzing keylogs from the past 15 minutes.

Here are the keylogs:
${keylogText}

Please write a concise summary in this format:

Goals:
- (2-3 bullets)

Confusions:
- (2-3 bullets)

Useful questions:
- (3-6 bullets; these can be psychological, strategic, or about tools/concepts I might not know that could be relevant)

Keep it grounded in evidence from the keylogs when possible, but it is okay to speculate as long as you clearly mark it as speculation.`

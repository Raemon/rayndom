type GoalsPromptParams = {
  keylogText: string
  screenshotText: string
  existingDocument: string | null
  existingSubdocuments: { name: string, content: string }[]
}
export const getGoalsPrompt = ({ keylogText, screenshotText, existingDocument, existingSubdocuments }: GoalsPromptParams) => {
  const subdocSection = existingSubdocuments.length > 0
    ? `\n\n## Existing Subdocuments\n${existingSubdocuments.map(d => `### ${d.name}\n${d.content}`).join('\n\n')}`
    : ''
  return `You are maintaining a comprehensive, evolving markdown document that maps out a user's life goals. ${existingDocument
    ? `Here is the current version of the document:\n\n---\n${existingDocument}\n---${subdocSection}`
    : 'No document exists yet. Create the initial version based on available evidence.'
  }

Here is recent data about what the user has been doing on their computer:

${keylogText ? `## Recent Keylogs\n${keylogText}` : '(No keylog data available)'}
${screenshotText ? `## Recent Screenshot Summaries\n${screenshotText}` : '(No screenshot data available)'}

Your task is to ${existingDocument ? 'update' : 'create'} the life goals document. Guidelines:

- Structure with clear top-level sections for life domains (e.g. Career, Health, Relationships, Learning, Creative, Financial, Projects)
- Within each section, list specific goals and sub-goals as bullet points
- Where a goal area is complex enough to warrant deeper elaboration, include a markdown link like [more detail](./goals/topic-name.md) — these will become separate subdocuments
- Add brief evidence as title text.
- Be comprehensive — aim to capture the full picture of what matters to the user
- ${existingDocument ? 'Preserve existing goals and structure unless clearly contradicted by new evidence. Add new goals or refine existing ones as appropriate. Do not remove sections.' : 'Infer as much as you can from the available data. Mark uncertain inferences with "(?)" so the user can confirm or correct.'}
- Keep the tone direct and concise — this is a working document, not an essay
- Start with a # Life Goals heading, include a "Last updated: YYYY-MM-DD" line at the top

Output ONLY the complete updated markdown document. Do not include any commentary outside the document.

Do NOT include small bits of evidence that aren't actually that useful (i.e. particular localhost ports)

Do NOT include links to subdocuments that don't actually exist.
`
}

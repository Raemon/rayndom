export type MentionItem = { id: string, label: string, badgeColor?: string }
export type CommandItem = { id: string, label: string }
export const COMMAND_ITEMS: CommandItem[] = [{ id: 'think-it-faster', label: 'Think It Faster' }]
export const getThinkItFasterHtml = () => {
  return '<p><strong>What did you do?</strong></p><p></p><p><strong>Magic Short Path?</strong></p><p></p><p><strong>Observations</strong></p><p></p><p><strong>Confusions</strong></p><p></p><p><strong>Triggers and Actions</strong></p><p></p>'
}

export const buildChecklistUrl = (orientingOnly: boolean, section?: string): string => {
  const params = new URLSearchParams()
  if (orientingOnly) params.set('orientingOnly', 'true')
  if (section) params.set('section', section)
  const queryString = params.toString()
  return `/api/checklist${queryString ? `?${queryString}` : ''}`
}

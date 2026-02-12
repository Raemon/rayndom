const isLikelySafeUserMessage = (message: string) => {
  const trimmedMessage = message.trim()
  if (!trimmedMessage) return false
  if (trimmedMessage.length > 140) return false
  if (trimmedMessage.includes('\n')) return false
  const lowercaseMessage = trimmedMessage.toLowerCase()
  const internalErrorMarkers = ['prisma', 'sql', 'select ', 'insert ', 'update ', 'delete ', 'stack', 'exception', ' at ']
  for (const internalErrorMarker of internalErrorMarkers) {
    if (lowercaseMessage.includes(internalErrorMarker)) return false
  }
  return true
}

export const getApiErrorMessage = (json: unknown, fallback: string) => {
  if (json && typeof json === 'object') {
    const message = (json as { error?: string, message?: string }).error || (json as { error?: string, message?: string }).message
    if (typeof message === 'string' && isLikelySafeUserMessage(message)) return message.trim()
  }
  return fallback
}

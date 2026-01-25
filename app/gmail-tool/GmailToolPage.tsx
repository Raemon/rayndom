'use client'
import { useEffect, useState } from 'react'

type GmailMessage = {
  id: string
  threadId?: string
  snippet: string
  from: string
  subject: string
  date: string
}

const GmailToolPage = ({}:{}) => {
  const [query, setQuery] = useState('in:inbox')
  const [messages, setMessages] = useState<GmailMessage[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadMessages = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/gmail?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to load messages')
        setMessages([])
        return
      }
      setMessages(data.messages || [])
    } catch {
      setError('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const toggleSelected = (messageId: string) => {
    setSelectedIds((currentSelectedIds) => currentSelectedIds.includes(messageId)
      ? currentSelectedIds.filter((selectedId) => selectedId !== messageId)
      : [...currentSelectedIds, messageId]
    )
  }

  const archiveSelected = async () => {
    if (!selectedIds.length) return
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: selectedIds })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to archive messages')
        return
      }
      setSelectedIds([])
      loadMessages()
    } catch {
      setError('Failed to archive messages')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 text-sm">
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="px-2 py-1 bg-gray-100 outline-none flex-1"
          placeholder="Gmail search query"
        />
        <button onClick={loadMessages} className="px-2 py-1 bg-gray-200">Refresh</button>
        <button onClick={archiveSelected} className="px-2 py-1 bg-gray-200">Archive</button>
      </div>
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {isLoading && <div className="mt-2">Loading...</div>}
      {!isLoading && (
        <div className="mt-2 flex flex-col gap-1">
          {messages.map((message) => (
            <div key={message.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(message.id)}
                onChange={() => toggleSelected(message.id)}
              />
              <div className="w-[220px] truncate">{message.from || '(no sender)'}</div>
              <div className="flex-1 truncate">{message.subject || '(no subject)'}</div>
              <div className="flex-[2] truncate text-gray-600">{message.snippet}</div>
            </div>
          ))}
          {messages.length === 0 && <div className="text-gray-600">No messages</div>}
        </div>
      )}
    </div>
  )
}

export default GmailToolPage

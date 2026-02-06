'use client'
import { useState } from 'react'

const ChangePasswordForm = ({ onClose }: { onClose: () => void }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setSuccess(true)
      setTimeout(onClose, 1500)
    } else {
      setError(data.error || 'Failed to change password')
    }
  }
  if (success) return <div className="text-green-400 text-xs">Password changed!</div>
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
        className="px-2 py-1 bg-gray-800 text-white text-sm" required autoFocus />
      <input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)}
        className="px-2 py-1 bg-gray-800 text-white text-sm" required minLength={6} />
      {error && <div className="text-red-400 text-xs">{error}</div>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-2 py-1 bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50">
          {loading ? '...' : 'Change'}
        </button>
        <button type="button" onClick={onClose} className="px-2 py-1 text-gray-400 text-sm hover:text-white">Cancel</button>
      </div>
    </form>
  )
}

export default ChangePasswordForm

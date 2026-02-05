'use client'
import { useEffect, useState } from 'react'

type User = {
  id: number
  email: string
  createdAt: string
  updatedAt: string
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => { setUsers(data.users || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])
  if (loading) return <div className="p-4 text-sm text-white">Loading...</div>
  return (
    <div className="p-4 text-sm">
      <div className="text-lg text-white mb-2">Users ({users.length})</div>
      <div className="flex flex-col gap-1">
        {users.map(user => (
          <div key={user.id} className="flex items-center gap-4 text-white text-xs">
            <span className="w-8">{user.id}</span>
            <span className="flex-1">{user.email}</span>
            <span className="text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UsersPage

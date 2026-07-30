'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Kanban } from 'lucide-react'
import { apiRequest, setCurrentWorkspace, getWorkspaces, setWorkspaces } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'

export default function NewWorkspacePage() {
  useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      const updated = [...getWorkspaces(), { ...data, role: 'OWNER' }]
      setWorkspaces(updated)
      setCurrentWorkspace({ ...data, role: 'OWNER' })
      router.push(`/workspace/${data.slug}/projects`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <Kanban className="w-4 h-4 text-gray-900" />
          </div>
          <span className="font-semibold text-white">TaskFlow</span>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight">New workspace</h2>
          <p className="text-gray-500 text-sm mb-6">Create a separate workspace for a different team or project.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
              placeholder="My new workspace"
            />
          </div>

          <button onClick={handleCreate} disabled={loading || !name.trim()}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : 'Create workspace'}
          </button>
        </div>
      </div>
    </div>
  )
}
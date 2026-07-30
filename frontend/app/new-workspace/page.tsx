'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'
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
    setLoading(true); setError('')
    try {
      const res = await apiRequest('/workspaces', { method: 'POST', body: JSON.stringify({ name }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      const updated = [...getWorkspaces(), { ...data, role: 'OWNER' }]
      setWorkspaces(updated)
      setCurrentWorkspace({ ...data, role: 'OWNER' })
      router.push(`/workspace/${data.slug}/projects`)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-[#e6edf3] text-xl tracking-tight">TaskFlow</span>
          </Link>
          <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight">New workspace</h1>
          <p className="text-[#7d8590] text-sm mt-1">Create a workspace for a different team or client.</p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">Workspace name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="My new workspace" />
          </div>
          <button onClick={handleCreate} disabled={loading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-colors">
            {loading ? 'Creating...' : <><span>Create workspace</span><ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiRequest, removeToken } from '@/lib/auth'
import { AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  useAuth()
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [workspace, setWorkspace] = useState<any>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!slug) return
    apiRequest(`/workspaces/${slug}`).then(r => r.json()).then(d => { setWorkspace(d); setName(d.name) })
  }, [slug])

  const saveName = async () => {
    if (!name.trim() || name === workspace?.name) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await apiRequest(`/workspaces/${slug}`, { method: 'PATCH', body: JSON.stringify({ name }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setWorkspace(data); setSuccess('Workspace name updated')
    } finally { setSaving(false) }
  }

  const deleteWorkspace = async () => {
    if (deleteConfirm !== workspace?.name) return
    setDeleting(true)
    try {
      const res = await apiRequest(`/workspaces/${slug}`, { method: 'DELETE' })
      if (res.ok) { removeToken(); router.push('/') }
    } finally { setDeleting(false) }
  }

  if (!workspace) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isOwner = workspace.role === 'OWNER'

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight mb-8">Settings</h1>

      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-[#e6edf3] mb-4">Workspace name</h2>
        {success && (
          <div className="bg-[#238636]/10 border border-[#238636]/30 text-[#238636] text-sm px-4 py-3 rounded-xl mb-4">{success}</div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}
        <div className="flex gap-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            disabled={!isOwner}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50" />
          {isOwner && (
            <button onClick={saveName} disabled={saving || name === workspace.name}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
        <p className="text-xs text-[#7d8590] mt-2">Slug: <span className="font-mono text-[#e6edf3]">{workspace.slug}</span></p>
      </div>

      {isOwner && (
        <div className="bg-[#161b22] border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-red-400">Danger zone</h2>
          </div>
          <p className="text-xs text-[#7d8590] mb-4">
            Permanently deletes this workspace, all projects, issues, and members. This cannot be undone.
          </p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">
              Type <span className="font-mono text-[#e6edf3] font-bold">{workspace.name}</span> to confirm
            </label>
            <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              className="w-full bg-[#0d1117] border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-red-500 transition-colors"
              placeholder={workspace.name} />
          </div>
          <button onClick={deleteWorkspace}
            disabled={deleteConfirm !== workspace.name || deleting}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
            {deleting ? 'Deleting...' : 'Delete workspace'}
          </button>
        </div>
      )}
    </div>
  )
}
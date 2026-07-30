'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiRequest, removeToken } from '@/lib/auth'

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
    apiRequest(`/workspaces/${slug}`).then(r => r.json()).then(d => {
      setWorkspace(d)
      setName(d.name)
    })
  }, [slug])

  const saveName = async () => {
    if (!name.trim() || name === workspace?.name) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await apiRequest(`/workspaces/${slug}`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setWorkspace(data)
      setSuccess('Workspace name updated')
    } finally {
      setSaving(false)
    }
  }

  const deleteWorkspace = async () => {
    if (deleteConfirm !== workspace?.name) return
    setDeleting(true)
    try {
      const res = await apiRequest(`/workspaces/${slug}`, { method: 'DELETE' })
      if (res.ok) {
        removeToken()
        router.push('/')
      }
    } finally {
      setDeleting(false)
    }
  }

  if (!workspace) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isOwner = workspace.role === 'OWNER'

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-8">Settings</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Workspace name</h2>

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">{success}</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="flex gap-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            disabled={!isOwner} />
          {isOwner && (
            <button onClick={saveName} disabled={saving || name === workspace.name}
              className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Slug: <span className="font-mono">{workspace.slug}</span></p>
      </div>

      {isOwner && (
        <div className="bg-white border border-red-100 rounded-xl p-6">
          <h2 className="text-sm font-medium text-red-600 mb-2">Danger zone</h2>
          <p className="text-xs text-gray-500 mb-4">
            Deleting this workspace will permanently remove all projects, issues, and members. This cannot be undone.
          </p>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Type <span className="font-mono font-semibold">{workspace.name}</span> to confirm
            </label>
            <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              className="w-full border border-red-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={workspace.name} />
          </div>
          <button
            onClick={deleteWorkspace}
            disabled={deleteConfirm !== workspace.name || deleting}
            className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
            {deleting ? 'Deleting...' : 'Delete workspace'}
          </button>
        </div>
      )}
    </div>
  )
}
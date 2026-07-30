'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, FolderOpen, ArrowRight, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { apiRequest } from '@/lib/auth'

export default function ProjectsPage() {
  useAuth()
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const fetchProjects = async () => {
    const res = await apiRequest(`/workspaces/${slug}/projects`)
    const data = await res.json()
    setProjects(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { if (slug) fetchProjects() }, [slug])

  const createProject = async () => {
    if (!name.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await apiRequest(`/workspaces/${slug}/projects`, {
        method: 'POST',
        body: JSON.stringify({ name, description })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setShowModal(false)
      setName('')
      setDescription('')
      fetchProjects()
    } finally {
      setCreating(false)
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    TODO: 'bg-gray-400',
    IN_PROGRESS: 'bg-blue-500',
    IN_REVIEW: 'bg-yellow-500',
    DONE: 'bg-green-500',
    CANCELLED: 'bg-red-400'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-16 text-center">
          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first project to start tracking issues.</p>
          <button onClick={() => setShowModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
            Create project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map(project => (
            <button key={project.id}
              onClick={() => router.push(`/workspace/${slug}/projects/${project.id}`)}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all text-left group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-gray-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-1">{project.name}</h3>
              <p className="text-xs text-gray-400 mb-3 font-mono">{project.identifier}</p>
              {project.description && (
                <p className="text-xs text-gray-500 mb-3 truncate">{project.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                {Object.entries(project.statusCounts || {}).map(([status, count]) =>
                  (count as number) > 0 ? (
                    <div key={status} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
                      <span className="text-xs text-gray-400">{count as number}</span>
                    </div>
                  ) : null
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">New project</h2>
              <button onClick={() => { setShowModal(false); setError('') }}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
            )}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createProject()} autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                  placeholder="Engineering" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                  placeholder="What is this project for?" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setError('') }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={createProject} disabled={creating || !name.trim()}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Kanban, FolderOpen, Users, Check } from 'lucide-react'
import { apiRequest, getCurrentWorkspace, setCurrentWorkspace, getUser } from '@/lib/auth'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspace, setWorkspace] = useState<any>(null)
  const [projectName, setProjectName] = useState('')
  const [project, setProject] = useState<any>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const current = getCurrentWorkspace()
    if (current) {
      setWorkspace(current)
      setWorkspaceName(current.name)
    }
  }, [])

  const saveWorkspace = async () => {
    if (!workspaceName.trim() || !workspace) { setStep(2); return }
    setLoading(true)
    try {
      const res = await apiRequest(`/workspaces/${workspace.slug}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: workspaceName })
      })
      if (res.ok) {
        const data = await res.json()
        setWorkspace(data)
        setCurrentWorkspace({ ...data, role: 'OWNER' })
      }
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim()) { setStep(3); return }
    setLoading(true)
    setError('')
    try {
      await apiRequest(`/workspaces/${workspace.slug}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: 'MEMBER' })
      })
      setStep(3)
    } catch {
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (!projectName.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest(`/workspaces/${workspace.slug}/projects`, {
        method: 'POST',
        body: JSON.stringify({ name: projectName })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setProject(data)
      router.push(`/workspace/${workspace.slug}/projects/${data.id}`)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: 'Name workspace', icon: <Kanban className="w-3.5 h-3.5" /> },
    { num: 2, label: 'Invite team', icon: <Users className="w-3.5 h-3.5" /> },
    { num: 3, label: 'First project', icon: <FolderOpen className="w-3.5 h-3.5" /> }
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <Kanban className="w-4 h-4 text-gray-900" />
          </div>
          <span className="font-semibold text-white">TaskFlow</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === s.num ? 'bg-white text-gray-900' :
                step > s.num ? 'bg-green-500/20 text-green-400' :
                'bg-white/10 text-gray-500'
              }`}>
                {step > s.num ? <Check className="w-3 h-3" /> : s.icon}
                {s.label}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 h-px ${step > s.num ? 'bg-green-500/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-2xl">

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight">Name your workspace</h2>
              <p className="text-gray-500 text-sm mb-6">This is how your team will identify this workspace.</p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace name</label>
                <input type="text" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveWorkspace()}
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                  placeholder="Acme Corp" />
              </div>
              <button onClick={saveWorkspace} disabled={loading}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Continue →'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight">Invite your team</h2>
              <p className="text-gray-500 text-sm mb-6">Add teammates to your workspace. You can always do this later.</p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendInvite()}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                  placeholder="teammate@company.com" />
              </div>
              <button onClick={sendInvite} disabled={loading}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 mb-3">
                {loading ? 'Sending...' : 'Send invite →'}
              </button>
              <button onClick={() => setStep(3)}
                className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors">
                Skip for now
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight">Create your first project</h2>
              <p className="text-gray-500 text-sm mb-6">Projects hold your issues and kanban board.</p>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project name</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createProject()}
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                  placeholder="Engineering" />
              </div>
              <button onClick={createProject} disabled={loading || !projectName.trim()}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create project →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
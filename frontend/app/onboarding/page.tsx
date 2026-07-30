'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, FolderOpen, Users, Check, ArrowRight } from 'lucide-react'
import { apiRequest, getCurrentWorkspace, setCurrentWorkspace } from '@/lib/auth'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspace, setWorkspace] = useState<any>(null)
  const [projectName, setProjectName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const current = getCurrentWorkspace()
    if (current) { setWorkspace(current); setWorkspaceName(current.name) }
  }, [])

  const saveWorkspace = async () => {
    if (!workspace) { setStep(2); return }
    setLoading(true)
    try {
      const res = await apiRequest(`/workspaces/${workspace.slug}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: workspaceName })
      })
      if (res.ok) { const d = await res.json(); setWorkspace(d); setCurrentWorkspace({ ...d, role: 'OWNER' }) }
      setStep(2)
    } finally { setLoading(false) }
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim()) { setStep(3); return }
    setLoading(true)
    try {
      await apiRequest(`/workspaces/${workspace.slug}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: 'MEMBER' })
      })
      setStep(3)
    } catch { setStep(3) }
    finally { setLoading(false) }
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
      router.push(`/workspace/${workspace.slug}/projects/${data.id}`)
    } finally { setLoading(false) }
  }

  const steps = [
    { num: 1, label: 'Name workspace', icon: <Zap className="w-3.5 h-3.5" /> },
    { num: 2, label: 'Invite team', icon: <Users className="w-3.5 h-3.5" /> },
    { num: 3, label: 'First project', icon: <FolderOpen className="w-3.5 h-3.5" /> }
  ]

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-[#e6edf3] text-xl tracking-tight">TaskFlow</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                step === s.num ? 'bg-orange-500 text-white' :
                step > s.num ? 'bg-[#238636]/20 text-[#238636]' :
                'bg-[#161b22] text-[#7d8590] border border-[#30363d]'
              }`}>
                {step > s.num ? <Check className="w-3 h-3" /> : s.icon}
                {s.label}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 h-px ${step > s.num ? 'bg-[#238636]/40' : 'bg-[#30363d]'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-7 shadow-2xl">

          {step === 1 && (
            <div>
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center mb-5">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-black text-[#e6edf3] mb-1 tracking-tight">Name your workspace</h2>
              <p className="text-[#7d8590] text-sm mb-6 leading-relaxed">This is how your team identifies this workspace.</p>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">Workspace name</label>
                <input type="text" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveWorkspace()} autoFocus
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Acme Corp" />
              </div>
              <button onClick={saveWorkspace} disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full transition-colors text-sm">
                {loading ? 'Saving...' : <><span>Continue</span><ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="w-10 h-10 bg-[#238636]/10 border border-[#238636]/30 rounded-xl flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-[#238636]" />
              </div>
              <h2 className="text-lg font-black text-[#e6edf3] mb-1 tracking-tight">Invite your team</h2>
              <p className="text-[#7d8590] text-sm mb-6 leading-relaxed">Add teammates to your workspace. Skip this if you want to do it later.</p>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">Email address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendInvite()}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="teammate@company.com" />
              </div>
              <button onClick={sendInvite} disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full transition-colors text-sm mb-3">
                {loading ? 'Sending...' : <><span>Send invite</span><ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
              <button onClick={() => setStep(3)}
                className="w-full text-[#7d8590] text-sm hover:text-[#e6edf3] transition-colors py-1">
                Skip for now
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center mb-5">
                <FolderOpen className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-black text-[#e6edf3] mb-1 tracking-tight">Create your first project</h2>
              <p className="text-[#7d8590] text-sm mb-6 leading-relaxed">Projects hold your kanban board and issues.</p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
              )}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">Project name</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createProject()} autoFocus
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Engineering" />
              </div>
              <button onClick={createProject} disabled={loading || !projectName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full transition-colors text-sm">
                {loading ? 'Creating...' : <><span>Create project</span><ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
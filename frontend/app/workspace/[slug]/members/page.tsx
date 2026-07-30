'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { UserPlus, X, Trash2, Crown, Shield, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { apiRequest } from '@/lib/auth'

const ROLE_CONFIG: Record<string, { color: string; icon: any }> = {
  OWNER: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/30', icon: Crown },
  ADMIN: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Shield },
  MEMBER: { color: 'bg-[#30363d] text-[#7d8590] border-[#30363d]', icon: User }
}

export default function MembersPage() {
  useAuth()
  const params = useParams()
  const slug = params?.slug as string
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MEMBER')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState('')

  const fetchMembers = async () => {
    const res = await apiRequest(`/workspaces/${slug}/members`)
    if (res.ok) setMembers(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (!slug) return
    fetchMembers()
    apiRequest(`/workspaces/${slug}`).then(r => r.json()).then(d => setCurrentUserRole(d.role || ''))
  }, [slug])

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true); setError(''); setSuccess('')
    try {
      const res = await apiRequest(`/workspaces/${slug}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail(''); setShowInvite(false)
    } finally { setInviting(false) }
  }

  const removeMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return
    await apiRequest(`/workspaces/${slug}/members/${userId}`, { method: 'DELETE' })
    fetchMembers()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const canManage = ['OWNER', 'ADMIN'].includes(currentUserRole)

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight">Members</h1>
          <p className="text-sm text-[#7d8590] mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-full transition-colors text-sm">
            <UserPlus className="w-3.5 h-3.5" /> Invite member
          </button>
        )}
      </div>

      {success && (
        <div className="bg-[#238636]/10 border border-[#238636]/30 text-[#238636] text-sm px-4 py-3 rounded-xl mb-6">
          {success}
        </div>
      )}

      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
        <div className="divide-y divide-[#30363d]">
          {members.map(member => {
            const roleConfig = ROLE_CONFIG[member.role]
            const RoleIcon = roleConfig.icon
            return (
              <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#0d1117]/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-500 text-sm font-black flex-shrink-0">
                    {member.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#e6edf3]">{member.user.name}</p>
                    <p className="text-xs text-[#7d8590]">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border ${roleConfig.color}`}>
                    <RoleIcon className="w-3 h-3" />{member.role}
                  </span>
                  <span className="text-xs text-[#7d8590]">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                  {canManage && member.role !== 'OWNER' && (
                    <button onClick={() => removeMember(member.userId)}
                      className="text-[#30363d] hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[#e6edf3] tracking-tight">Invite member</h2>
              <button onClick={() => { setShowInvite(false); setError('') }} className="text-[#7d8590] hover:text-[#e6edf3]">
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">Email address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendInvite()} autoFocus
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="teammate@company.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-orange-500 transition-colors">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowInvite(false); setError('') }}
                className="flex-1 border border-[#30363d] text-[#7d8590] py-2.5 rounded-full text-sm font-semibold hover:text-[#e6edf3] transition-colors">
                Cancel
              </button>
              <button onClick={sendInvite} disabled={inviting || !inviteEmail.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-colors">
                {inviting ? 'Sending...' : 'Send invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
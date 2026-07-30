'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { UserPlus, X, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { apiRequest } from '@/lib/auth'

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-gray-100 text-gray-600'
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
    if (res.ok) {
      const data = await res.json()
      setMembers(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!slug) return
    fetchMembers()
    apiRequest(`/workspaces/${slug}`).then(r => r.json()).then(d => {
      setCurrentUserRole(d.role || '')
    })
  }, [slug])

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setError('')
    setSuccess('')
    try {
      const res = await apiRequest(`/workspaces/${slug}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setShowInvite(false)
    } finally {
      setInviting(false)
    }
  }

  const removeMember = async (userId: string) => {
    if (!confirm('Remove this member from the workspace?')) return
    await apiRequest(`/workspaces/${slug}/members/${userId}`, { method: 'DELETE' })
    fetchMembers()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const canManage = ['OWNER', 'ADMIN'].includes(currentUserRole)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
            <UserPlus className="w-3.5 h-3.5" /> Invite member
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-50">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-semibold flex-shrink-0">
                  {member.user.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                  <p className="text-xs text-gray-400">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[member.role]}`}>
                  {member.role}
                </span>
                <span className="text-xs text-gray-400">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
                {canManage && member.role !== 'OWNER' && (
                  <button onClick={() => removeMember(member.userId)}
                    className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Invite member</h2>
              <button onClick={() => { setShowInvite(false); setError('') }}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendInvite()} autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="teammate@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowInvite(false); setError('') }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={sendInvite} disabled={inviting || !inviteEmail.trim()}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                {inviting ? 'Sending...' : 'Send invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
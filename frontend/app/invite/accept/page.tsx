'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Check, AlertTriangle, ArrowRight } from 'lucide-react'
import { apiRequest, getToken, setToken, setWorkspaces, setCurrentWorkspace } from '@/lib/auth'

export default function InviteAcceptPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'register'>('loading')
  const [message, setMessage] = useState('')
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid invitation link.'); return }
    acceptInvite()
  }, [token])

  const acceptInvite = async () => {
    try {
      const userToken = getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (userToken) headers['Authorization'] = `Bearer ${userToken}`

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invite/accept?token=${token}`, { headers })
      const data = await res.json()

      if (data.requiresRegistration) {
        setInviteEmail(data.email)
        setWorkspaceName(data.workspaceName)
        setWorkspaceSlug(data.workspaceSlug)
        setStatus('register')
        return
      }

      if (!res.ok) { setStatus('error'); setMessage(data.error || 'Failed to accept invitation'); return }

      setWorkspaceSlug(data.workspaceSlug)
      setStatus('success')
      setMessage('You have joined the workspace!')

      setTimeout(() => router.push(`/workspace/${data.workspaceSlug}/projects`), 2000)
    } catch { setStatus('error'); setMessage('Something went wrong.') }
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
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-7 text-center">

          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#7d8590] text-sm">Processing your invitation...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 bg-[#238636]/10 border border-[#238636]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#238636]" />
              </div>
              <h2 className="font-black text-[#e6edf3] text-lg mb-2 tracking-tight">Invitation accepted!</h2>
              <p className="text-[#7d8590] text-sm mb-6">{message}</p>
              <Link href={`/workspace/${workspaceSlug}/projects`}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-full text-sm transition-colors">
                Go to workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="font-black text-[#e6edf3] text-lg mb-2 tracking-tight">Invitation failed</h2>
              <p className="text-[#7d8590] text-sm mb-6">{message}</p>
              <Link href="/login"
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-full text-sm transition-colors">
                Go to login <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          {status === 'register' && (
            <>
              <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-orange-500" />
              </div>
              <h2 className="font-black text-[#e6edf3] text-lg mb-2 tracking-tight">You're invited!</h2>
              <p className="text-[#7d8590] text-sm mb-1">
                You've been invited to join <span className="font-bold text-[#e6edf3]">{workspaceName}</span>.
              </p>
              <p className="text-[#7d8590] text-sm mb-6">
                Create an account with <span className="text-orange-500 font-mono text-xs">{inviteEmail}</span> to accept.
              </p>
              <Link
                href={`/register?email=${encodeURIComponent(inviteEmail)}&token=${token}`}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-full text-sm transition-colors mb-3">
                Create account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href={`/login?token=${token}`}
                className="flex items-center justify-center gap-2 border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] font-semibold py-2.5 rounded-full text-sm transition-colors">
                Sign in instead
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight } from 'lucide-react'
import { setToken, setWorkspaces, setCurrentWorkspace, apiRequest } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      setToken(data.token)
      setWorkspaces(data.workspaces)
      const ws = data.workspaces[0]
      if (ws) { setCurrentWorkspace(ws); router.push(`/workspace/${ws.slug}/projects`) }
      else router.push('/onboarding')
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-black text-[#e6edf3] text-xl tracking-tight">TaskFlow</span>
          </Link>
          <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight">Welcome back</h1>
          <p className="text-[#7d8590] text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••••" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full transition-colors text-sm">
            {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>

        <p className="text-center text-sm text-[#7d8590] mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-400">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
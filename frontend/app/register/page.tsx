'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight } from 'lucide-react'
import { setToken, setWorkspaces, setCurrentWorkspace, apiRequest } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      setToken(data.token)
      setWorkspaces([{ ...data.workspace, role: 'OWNER' }])
      setCurrentWorkspace({ ...data.workspace, role: 'OWNER' })
      router.push('/onboarding')
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
          <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight">Create your account</h1>
          <p className="text-[#7d8590] text-sm mt-1">Free forever. No credit card required.</p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-5">
            {[
              { label: 'Full name', value: name, set: setName, type: 'text', placeholder: 'Priya Kumari' },
              { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: 'Min. 6 characters' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">{f.label}</label>
                <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder={f.placeholder} />
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full transition-colors text-sm">
            {loading ? 'Creating account...' : <><span>Create account</span><ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>

        <p className="text-center text-sm text-[#7d8590] mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-400">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
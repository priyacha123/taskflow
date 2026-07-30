'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Kanban } from 'lucide-react'
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
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex w-1/2 bg-gray-950 flex-col justify-between p-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <Kanban className="w-4 h-4 text-gray-900" />
          </div>
          <span className="font-semibold text-white">TaskFlow</span>
        </Link>
        <div>
          <p className="text-3xl font-bold text-white mb-3 leading-tight">
            Ship faster with your team.
          </p>
          <p className="text-gray-400 leading-relaxed">
            TaskFlow gives your team a shared workspace with kanban boards, issue tracking, and role-based access — all in one place.
          </p>
        </div>
        <p className="text-gray-600 text-xs">© 2026 TaskFlow</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">Free forever. No credit card required.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                placeholder="Xyz Choudhary" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                placeholder="Min. 6 characters" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-900 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
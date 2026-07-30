'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Check, Zap, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { apiRequest } from '@/lib/auth'

export default function BillingPage() {
  useAuth()
  const params = useParams()
  const slug = params?.slug as string

  const [billing, setBilling] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const fetchBilling = async () => {
    const res = await apiRequest(`/workspaces/${slug}/billing/status`)
    const data = await res.json()
    setBilling(data)
    setLoading(false)
  }

  useEffect(() => { if (slug) fetchBilling() }, [slug])

  const handleUpgrade = async () => {
    setProcessing(true)
    setError('')
    try {
      const res = await apiRequest(`/workspaces/${slug}/billing/checkout`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      window.location.href = data.url
    } finally {
      setProcessing(false)
    }
  }

  const handlePortal = async () => {
    setProcessing(true)
    try {
      const res = await apiRequest(`/workspaces/${slug}/billing/portal`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) window.location.href = data.url
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isPro = billing?.plan === 'PRO'

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-8">Billing</h1>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Current plan</p>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{isPro ? 'Pro' : 'Free'}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isPro ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {billing?.subscriptionStatus}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{isPro ? '$12/month' : '$0/forever'}</p>
          </div>

          {!isPro ? (
            <button onClick={handleUpgrade} disabled={processing}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
              <Zap className="w-3.5 h-3.5" />
              {processing ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          ) : (
            <button onClick={handlePortal} disabled={processing}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 px-4 py-2 rounded-lg">
              {processing ? 'Loading...' : 'Manage subscription'}
            </button>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-50">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Usage</p>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Projects</span>
              <span className="text-gray-900 font-medium">{billing?.usage?.projects} / {billing?.limits?.projects}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gray-900 transition-all"
                style={{ width: isPro ? '10%' : `${Math.min((billing?.usage?.projects / 5) * 100, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Members</span>
              <span className="text-gray-900 font-medium">{billing?.usage?.members} / {billing?.limits?.members}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gray-900 transition-all"
                style={{ width: isPro ? '10%' : `${Math.min((billing?.usage?.members / 10) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {!isPro && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <p className="text-sm font-medium text-gray-900 mb-4">Pro plan includes</p>
          <ul className="space-y-3">
            {[
              'Unlimited projects',
              'Unlimited members',
              'Advanced analytics',
              'Priority support',
              'Custom labels'
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button onClick={handleUpgrade} disabled={processing}
            className="mt-6 w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
            {processing ? 'Loading...' : 'Upgrade to Pro — $12/month'}
          </button>
        </div>
      )}
    </div>
  )
}
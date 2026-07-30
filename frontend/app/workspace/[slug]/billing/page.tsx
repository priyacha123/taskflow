'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Check, Zap, AlertTriangle, Crown } from 'lucide-react'
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
  const searchParams = useSearchParams()
const [successMessage, setSuccessMessage] = useState('')

useEffect(() => {
  if (searchParams.get('success') === 'true') {
    setSuccessMessage('🎉 You are now on the Pro plan! All limits have been lifted.')
    window.history.replaceState({}, '', `/workspace/${slug}/billing`)
  }
}, [searchParams, slug])

  const fetchBilling = async () => {
    const res = await apiRequest(`/workspaces/${slug}/billing/status`)
    setBilling(await res.json())
    setLoading(false)
  }

  useEffect(() => { if (slug) fetchBilling() }, [slug])

  const handleUpgrade = async () => {
    setProcessing(true); setError('')
    try {
      const res = await apiRequest(`/workspaces/${slug}/billing/checkout`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      window.location.href = data.url
    } finally { setProcessing(false) }
  }

  const handlePortal = async () => {
    setProcessing(true)
    try {
      const res = await apiRequest(`/workspaces/${slug}/billing/portal`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) window.location.href = data.url
    } finally { setProcessing(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isPro = billing?.plan === 'PRO'

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight mb-8">Billing</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {successMessage && (
  <div className="bg-[#238636]/10 border border-[#238636]/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
    <Check className="w-4 h-4 text-[#238636] shrink-0" />
    <p className="text-sm text-[#238636] font-semibold">{successMessage}</p>
  </div>
)}

      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-2">Current plan</p>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-[#e6edf3] tracking-tight">{isPro ? 'Pro' : 'Starter'}</h2>
              {isPro && <Crown className="w-5 h-5 text-orange-500" />}
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${isPro ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/30' : 'bg-[#30363d] text-[#7d8590] border-[#30363d]'}`}>
                {billing?.subscriptionStatus}
              </span>
            </div>
            <p className="text-[#7d8590] text-sm">{isPro ? '$12/month' : '$0/forever'}</p>
          </div>

          {!isPro ? (
            <button onClick={handleUpgrade} disabled={processing}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
              <Zap className="w-3.5 h-3.5" />
              {processing ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          ) : (
            <button onClick={handlePortal} disabled={processing}
              className="border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
              {processing ? 'Loading...' : 'Manage subscription'}
            </button>
          )}
        </div>

        <div className="space-y-4 pt-5 border-t border-[#30363d]">
          <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-wide">Usage</p>
          {[
            { label: 'Projects', used: billing?.usage?.projects, limit: billing?.limits?.projects, max: 5 },
            { label: 'Members', used: billing?.usage?.members, limit: billing?.limits?.members, max: 10 },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#7d8590]">{item.label}</span>
                <span className="text-[#e6edf3] font-bold">{item.used} / {item.limit}</span>
              </div>
              <div className="w-full bg-[#0d1117] rounded-full h-2 border border-[#30363d]">
                <div className={`h-2 rounded-full transition-all ${isPro ? 'bg-[#238636]' : 'bg-orange-500'}`}
                  style={{ width: isPro ? '10%' : `${Math.min((item.used / item.max) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isPro && (
        <div className="bg-[#161b22] border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-bold text-[#e6edf3]">Pro plan includes</p>
          </div>
          <ul className="space-y-3 mb-6">
            {['Unlimited projects', 'Unlimited members', 'Advanced analytics', 'Priority support', 'Custom labels'].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-[#7d8590]">
                <Check className="w-4 h-4 text-[#238636] shrink-0" />{f}
              </li>
            ))}
          </ul>
          <button onClick={handleUpgrade} disabled={processing}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-full text-sm transition-colors">
            <Zap className="w-3.5 h-3.5" />
            {processing ? 'Loading...' : 'Upgrade to Pro — $12/month'}
          </button>
        </div>
      )}
    </div>
  )
}
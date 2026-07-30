'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getWorkspaces, getCurrentWorkspace, isAuthenticated } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }

    const current = getCurrentWorkspace()
    if (current?.slug) {
      router.push(`/workspace/${current.slug}/projects`)
      return
    }

    const workspaces = getWorkspaces()
    if (workspaces.length > 0) {
      router.push(`/workspace/${workspaces[0].slug}/projects`)
      return
    }

    router.push('/onboarding')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
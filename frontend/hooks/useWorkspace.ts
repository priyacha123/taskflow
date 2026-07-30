'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { apiRequest, setCurrentWorkspace, getCurrentWorkspace } from '@/lib/auth'

export const useWorkspace = () => {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const [workspace, setWorkspace] = useState<any>(getCurrentWorkspace())
  const [loading, setLoading] = useState(!workspace)

  useEffect(() => {
    if (!slug) return

    const fetch = async () => {
      const res = await apiRequest(`/workspaces/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setWorkspace(data)
        setCurrentWorkspace(data)
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
    }

    fetch()
  }, [slug])

  return { workspace, loading }
}
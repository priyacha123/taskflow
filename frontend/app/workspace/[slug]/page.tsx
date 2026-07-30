'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function WorkspaceIndexPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  useEffect(() => {
    if (slug) router.replace(`/workspace/${slug}/projects`)
  }, [slug, router])

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
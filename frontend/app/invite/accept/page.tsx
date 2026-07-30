// app/invite/accept/page.tsx
import { Suspense } from 'react'
import InviteAcceptClient from './accept-invite-client'

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<InviteAcceptFallback />}>
      <InviteAcceptClient />
    </Suspense>
  )
}

function InviteAcceptFallback() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
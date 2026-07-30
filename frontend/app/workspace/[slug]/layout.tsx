'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useParams } from 'next/navigation'
import {
  Kanban, FolderOpen, Users, Settings,
  CreditCard, LogOut, ChevronDown, Plus, Check
} from 'lucide-react'
import { getUser, logout, isAuthenticated, apiRequest, getWorkspaces, setCurrentWorkspace, setWorkspaces, getCurrentWorkspace } from '@/lib/auth'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const [user, setUser] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [workspaceList, setWorkspaceList] = useState<any[]>([])
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }

    const currentUser = getUser()
    setUser(currentUser)

    const fetchWorkspace = async () => {
      const [wsRes, allRes] = await Promise.all([
        apiRequest(`/workspaces/${slug}`),
        apiRequest('/workspaces')
      ])

      if (wsRes.ok) {
        const data = await wsRes.json()
        setWorkspace(data)
        setCurrentWorkspace(data)
      } else {
        router.push('/dashboard')
        return
      }

      if (allRes.ok) {
        const data = await allRes.json()
        setWorkspaceList(data)
        setWorkspaces(data)
      }

      setLoading(false)
    }

    fetchWorkspace()
  }, [slug, router])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isActive = (path: string) => pathname.includes(path)

  const navLinks = [
    { href: `/workspace/${slug}/projects`, label: 'Projects', icon: <FolderOpen className="w-4 h-4" /> },
    { href: `/workspace/${slug}/members`, label: 'Members', icon: <Users className="w-4 h-4" /> },
    { href: `/workspace/${slug}/settings`, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { href: `/workspace/${slug}/billing`, label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-gray-950 flex flex-col fixed h-full z-10">

        {/* Workspace switcher */}
        <div className="px-3 py-4 border-b border-gray-800">
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {workspace?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-white text-sm font-medium truncate flex-1 text-left">
              {workspace?.name}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
          </button>

          {showSwitcher && (
            <div className="mt-2 space-y-0.5">
              {workspaceList.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws)
                    setShowSwitcher(false)
                    router.push(`/workspace/${ws.slug}/projects`)
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-5 h-5 bg-gray-700 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {ws.name[0].toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-xs truncate flex-1 text-left">{ws.name}</span>
                  {ws.slug === slug && <Check className="w-3 h-3 text-green-400 flex-shrink-0" />}
                </button>
              ))}
              <button
                onClick={() => { setShowSwitcher(false); router.push('/new-workspace') }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors mt-1 border-t border-gray-800 pt-2"
              >
                <Plus className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500 text-xs">New workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(link.href.split('/').pop()!)
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{workspace?.role || 'MEMBER'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  )
}
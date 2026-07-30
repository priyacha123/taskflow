'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, List, Kanban, ArrowLeft, X, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { apiRequest } from '@/lib/auth'

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'] as const
type Status = typeof STATUSES[number]

const STATUS_LABELS: Record<Status, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  CANCELLED: 'Cancelled'
}

const STATUS_COLORS: Record<Status, string> = {
  TODO: 'bg-gray-400',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-yellow-500',
  DONE: 'bg-green-500',
  CANCELLED: 'bg-red-400'
}

const PRIORITY_ICONS: Record<string, string> = {
  NO_PRIORITY: '—',
  LOW: '↓',
  MEDIUM: '→',
  HIGH: '↑',
  URGENT: '⚡'
}

const PRIORITY_COLORS: Record<string, string> = {
  NO_PRIORITY: 'text-gray-400',
  LOW: 'text-blue-400',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500'
}

export default function ProjectPage() {
  useAuth()
  const params = useParams()
  const slug = params?.slug as string
  const projectId = params?.projectId as string

  const [project, setProject] = useState<any>(null)
  const [issues, setIssues] = useState<Record<Status, any[]>>({
    TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [], CANCELLED: []
  })
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStatus, setNewStatus] = useState<Status>('TODO')
  const [newPriority, setNewPriority] = useState('NO_PRIORITY')
  const [creating, setCreating] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<any>(null)

  const fetchIssues = useCallback(async () => {
    const [projRes, issuesRes] = await Promise.all([
      apiRequest(`/workspaces/${slug}/projects/${projectId}`),
      apiRequest(`/workspaces/${slug}/projects/${projectId}/issues`)
    ])
    if (projRes.ok) setProject(await projRes.json())
    if (issuesRes.ok) {
      const data = await issuesRes.json()
      setIssues(data)
    }
    setLoading(false)
  }, [slug, projectId])

  useEffect(() => { fetchIssues() }, [fetchIssues])

  const createIssue = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const res = await apiRequest(`/workspaces/${slug}/projects/${projectId}/issues`, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, status: newStatus, priority: newPriority })
      })
      if (res.ok) {
        setShowCreate(false)
        setNewTitle('')
        setNewStatus('TODO')
        setNewPriority('NO_PRIORITY')
        fetchIssues()
      }
    } finally {
      setCreating(false)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceStatus = source.droppableId as Status
    const destStatus = destination.droppableId as Status

    const newIssues = { ...issues }
    const sourceList = [...newIssues[sourceStatus]]
    const destList = sourceStatus === destStatus ? sourceList : [...newIssues[destStatus]]

    const [moved] = sourceList.splice(source.index, 1)
    destList.splice(destination.index, 0, moved)

    newIssues[sourceStatus] = sourceList
    if (sourceStatus !== destStatus) newIssues[destStatus] = destList

    setIssues(newIssues)

    const prevItem = destList[destination.index - 1]
    const nextItem = destList[destination.index + 1]
    let newPosition: number

    if (!prevItem && !nextItem) newPosition = 0
    else if (!prevItem) newPosition = nextItem.position - 1
    else if (!nextItem) newPosition = prevItem.position + 1
    else newPosition = (prevItem.position + nextItem.position) / 2

    await apiRequest(`/workspaces/${slug}/issues/${draggableId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: destStatus,
        position: newPosition
      })
    })
  }

  const fetchIssueDetail = async (issueId: string) => {
    const res = await apiRequest(`/workspaces/${slug}/issues/${issueId}`)
    if (res.ok) setSelectedIssue(await res.json())
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const allIssues = STATUSES.flatMap(s => issues[s])

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/workspace/${slug}/projects`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">{project?.name}</h1>
            <p className="text-xs text-gray-400 font-mono">{project?.identifier}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${view === 'kanban' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Kanban className="w-3.5 h-3.5" /> Board
            </button>
            <button onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700">
            <Plus className="w-3.5 h-3.5" /> New issue
          </button>
        </div>
      </div>

      {/* Kanban */}
      {view === 'kanban' && (
        <div className="flex-1 overflow-x-auto p-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full min-w-max">
              {STATUSES.map(status => (
                <div key={status} className="w-72 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
                    <span className="text-xs font-medium text-gray-600">{STATUS_LABELS[status]}</span>
                    <span className="text-xs text-gray-400 ml-auto">{issues[status].length}</span>
                  </div>
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 rounded-xl p-2 space-y-2 min-h-24 transition-colors ${snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-gray-50'}`}
                      >
                        {issues[status].map((issue, index) => (
                          <Draggable key={issue.id} draggableId={issue.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => fetchIssueDetail(issue.id)}
                                className={`bg-white border rounded-lg p-3 cursor-pointer hover:border-gray-300 transition-all ${snapshot.isDragging ? 'shadow-lg border-gray-300' : 'border-gray-100'}`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-xs font-medium text-gray-900 leading-relaxed">{issue.title}</p>
                                  <span className={`text-sm flex-shrink-0 ${PRIORITY_COLORS[issue.priority]}`}>
                                    {PRIORITY_ICONS[issue.priority]}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400 font-mono">{issue.identifier}</span>
                                  {issue.assignee && (
                                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-medium">
                                      {issue.assignee.name[0]}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide w-24">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide w-32">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide w-28">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide w-32">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allIssues.map(issue => (
                  <tr key={issue.id} onClick={() => fetchIssueDetail(issue.id)}
                    className="hover:bg-gray-50/50 cursor-pointer">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{issue.identifier}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{issue.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[issue.status as Status]}`} />
                        <span className="text-xs text-gray-600">{STATUS_LABELS[issue.status as Status]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${PRIORITY_COLORS[issue.priority]}`}>
                        {PRIORITY_ICONS[issue.priority]} {issue.priority.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {issue.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-medium">
                            {issue.assignee.name[0]}
                          </div>
                          <span className="text-xs text-gray-600">{issue.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allIssues.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">
                No issues yet. Create your first issue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create issue modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">New issue</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createIssue()} autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Issue title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value as Status)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                      <option key={p} value={p}>{p.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={createIssue} disabled={creating || !newTitle.trim()}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue detail slide-over */}
      {selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          slug={slug}
          onClose={() => setSelectedIssue(null)}
          onUpdate={() => { fetchIssues(); fetchIssueDetail(selectedIssue.id) }}
        />
      )}
    </div>
  )
}

function IssueDetail({ issue, slug, onClose, onUpdate }: {
  issue: any, slug: string, onClose: () => void, onUpdate: () => void
}) {
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(issue.title)

  const updateIssue = async (data: any) => {
    await apiRequest(`/workspaces/${slug}/issues/${issue.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
    onUpdate()
  }

  const saveTitle = async () => {
    if (title.trim() && title !== issue.title) {
      await updateIssue({ title })
    }
    setEditingTitle(false)
  }

  const postComment = async () => {
    if (!comment.trim()) return
    setPosting(true)
    try {
      await apiRequest(`/workspaces/${slug}/issues/${issue.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: comment })
      })
      setComment('')
      onUpdate()
    } finally {
      setPosting(false)
    }
  }

  const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']
  const PRIORITIES = ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-[480px] bg-white shadow-2xl overflow-y-auto flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-gray-400 font-mono">{issue.identifier}</span>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {editingTitle ? (
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle} onKeyDown={e => e.key === 'Enter' && saveTitle()} autoFocus
              className="w-full text-lg font-semibold text-gray-900 border-b-2 border-gray-900 focus:outline-none pb-1" />
          ) : (
            <h2 onClick={() => setEditingTitle(true)}
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-gray-600 transition-colors">
              {issue.title}
            </h2>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">Status</p>
              <select value={issue.status}
                onChange={e => updateIssue({ status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">Priority</p>
              <select value={issue.priority}
                onChange={e => updateIssue({ priority: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {issue.description && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
              Comments ({issue.comments?.length || 0})
            </p>
            <div className="space-y-3 mb-4">
              {issue.comments?.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-medium flex-shrink-0 mt-0.5">
                    {c.author.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-900">{c.author.name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && postComment()}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Add a comment..." />
              <button onClick={postComment} disabled={posting || !comment.trim()}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
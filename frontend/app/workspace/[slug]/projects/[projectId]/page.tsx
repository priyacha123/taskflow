"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, List, Kanban, ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/auth";
import {
  STATUSES,
  STATUS_LABELS,
  STATUS_DOT,
  PRIORITIES,
  PRIORITY_META,
  type Status,
  type Priority,
} from "@/lib/status";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";

export default function ProjectPage() {
  useAuth();
  const params = useParams();
  const slug = params?.slug as string;
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<any>(null);
  const [issues, setIssues] = useState<Record<Status, any[]>>({
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
    CANCELLED: [],
  });
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<Status>("TODO");
  const [newPriority, setNewPriority] = useState<Priority>("NO_PRIORITY");
  const [creating, setCreating] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const fetchIssues = useCallback(async () => {
    const [projRes, issuesRes] = await Promise.all([
      apiRequest(`/workspaces/${slug}/projects/${projectId}`),
      apiRequest(`/workspaces/${slug}/projects/${projectId}/issues`),
    ]);
    if (projRes.ok) setProject(await projRes.json());
    if (issuesRes.ok) {
      const data = await issuesRes.json();
      setIssues(data);
    }
    setLoading(false);
  }, [slug, projectId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const createIssue = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await apiRequest(`/workspaces/${slug}/projects/${projectId}/issues`, {
        method: "POST",
        body: JSON.stringify({ title: newTitle, status: newStatus, priority: newPriority }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewTitle("");
        setNewStatus("TODO");
        setNewPriority("NO_PRIORITY");
        fetchIssues();
      }
    } finally {
      setCreating(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;

    const sourceStatus = source.droppableId as Status;
    const destStatus = destination.droppableId as Status;

    const newIssues = { ...issues };
    const sourceList = [...newIssues[sourceStatus]];
    const destList = sourceStatus === destStatus ? sourceList : [...newIssues[destStatus]];

    const [moved] = sourceList.splice(source.index, 1);
    destList.splice(destination.index, 0, moved);

    newIssues[sourceStatus] = sourceList;
    if (sourceStatus !== destStatus) newIssues[destStatus] = destList;

    setIssues(newIssues);

    const prevItem = destList[destination.index - 1];
    const nextItem = destList[destination.index + 1];
    let newPosition: number;

    if (!prevItem && !nextItem) newPosition = 0;
    else if (!prevItem) newPosition = nextItem.position - 1;
    else if (!nextItem) newPosition = prevItem.position + 1;
    else newPosition = (prevItem.position + nextItem.position) / 2;

    await apiRequest(`/workspaces/${slug}/issues/${draggableId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: destStatus,
        position: newPosition,
      }),
    });
  };

  const fetchIssueDetail = async (issueId: string) => {
    const res = await apiRequest(`/workspaces/${slug}/issues/${issueId}`);
    if (res.ok) setSelectedIssue(await res.json());
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );

  const allIssues = STATUSES.flatMap((s) => issues[s]);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Link
            href={`/workspace/${slug}/projects`}
            className="rounded-md p-1 text-faint transition-colors hover:bg-sand hover:text-ink"
            aria-label="Back to projects"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-ink">{project?.name}</h1>
            <p className="font-mono text-xs text-faint">{project?.identifier}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-line bg-sand p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "kanban"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            <Plus className="h-3.5 w-3.5" /> New issue
          </button>
        </div>
      </div>

      {/* Kanban */}
      {view === "kanban" && (
        <div className="flex-1 overflow-x-auto p-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 min-w-max">
              {STATUSES.map((status) => (
                <div key={status} className="flex w-72 flex-col">
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                    <span className="text-xs font-semibold text-muted">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="ml-auto font-mono text-xs text-faint">
                      {issues[status].length}
                    </span>
                  </div>
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2 rounded-lg p-2 transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-accent-tint/60 ring-2 ring-accent/20"
                            : "bg-sand"
                        }`}
                      >
                        {issues[status].map((issue, index) => (
                          <Draggable key={issue.id} draggableId={issue.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => fetchIssueDetail(issue.id)}
                                className={`cursor-pointer rounded-lg border bg-surface p-3 transition-all ${
                                  snapshot.isDragging
                                    ? "border-faint shadow-lg"
                                    : "border-line hover:border-faint hover:shadow-sm"
                                }`}
                              >
                                <div className="mb-2 flex items-start justify-between gap-2">
                                  <p className="text-[13px] font-medium leading-snug text-ink">
                                    {issue.title}
                                  </p>
                                  <PriorityGlyph priority={issue.priority} />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs text-faint">
                                    {issue.identifier}
                                  </span>
                                  {issue.assignee && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-tint text-[10px] font-bold text-accent">
                                      {issue.assignee.name[0]}
                                    </span>
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
      {view === "list" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-faint">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-faint">
                    Title
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-faint">
                    Status
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-faint">
                    Priority
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-faint">
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {allIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => fetchIssueDetail(issue.id)}
                    className="cursor-pointer transition-colors hover:bg-sand/60"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-faint">
                      {issue.identifier}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink">{issue.title}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[issue.status as Status]}`} />
                        {STATUS_LABELS[issue.status as Status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs">
                        <PriorityGlyph priority={issue.priority} />
                        <span className={PRIORITY_META[issue.priority as Priority].className}>
                          {PRIORITY_META[issue.priority as Priority].label}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {issue.assignee ? (
                        <span className="flex items-center gap-1.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-tint text-[10px] font-bold text-accent">
                            {issue.assignee.name[0]}
                          </span>
                          <span className="text-xs text-muted">{issue.assignee.name}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-faint">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allIssues.length === 0 && (
              <div className="py-16 text-center text-sm text-muted">
                No issues yet. Create your first issue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create issue modal */}
      {showCreate && (
        <Modal
          title="New issue"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button onClick={() => setShowCreate(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={createIssue}
                disabled={creating || !newTitle.trim()}
                className="btn btn-primary flex-1"
              >
                {creating ? "Creating..." : "Create issue"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createIssue()}
                className="input"
                placeholder="Issue title"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Status)}
                  className="input"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="input"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Issue detail slide-over */}
      {selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          slug={slug}
          onClose={() => setSelectedIssue(null)}
          onUpdate={() => {
            fetchIssues();
            fetchIssueDetail(selectedIssue.id);
          }}
        />
      )}
    </div>
  );
}

function PriorityGlyph({ priority }: { priority: string }) {
  const meta = PRIORITY_META[priority as Priority] ?? PRIORITY_META.NO_PRIORITY;
  const Icon = meta.icon;
  return <Icon className={`h-4 w-4 shrink-0 ${meta.className}`} />;
}

function IssueDetail({
  issue,
  slug,
  onClose,
  onUpdate,
}: {
  issue: any;
  slug: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(issue.title);

  const updateIssue = async (data: any) => {
    await apiRequest(`/workspaces/${slug}/issues/${issue.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    onUpdate();
  };

  const saveTitle = async () => {
    if (title.trim() && title !== issue.title) {
      await updateIssue({ title });
    }
    setEditingTitle(false);
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await apiRequest(`/workspaces/${slug}/issues/${issue.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: comment }),
      });
      setComment("");
      onUpdate();
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink/20" onClick={onClose} />
      <div className="flex w-full max-w-md flex-col overflow-y-auto border-l border-line bg-surface shadow-xl sm:w-[480px]">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <span className="font-mono text-xs text-faint">{issue.identifier}</span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-faint transition-colors hover:bg-sand hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-6">
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              className="w-full border-b-2 border-accent pb-1 font-display text-xl font-semibold text-ink focus:outline-none"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="cursor-pointer font-display text-xl font-semibold leading-snug tracking-tight text-ink transition-colors hover:text-accent"
            >
              {issue.title}
            </h2>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label">Status</p>
              <select
                value={issue.status}
                onChange={(e) => updateIssue({ status: e.target.value })}
                className="input"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="label">Priority</p>
              <select
                value={issue.priority}
                onChange={(e) => updateIssue({ priority: e.target.value })}
                className="input"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {issue.description && (
            <div>
              <p className="label">Description</p>
              <p className="text-sm leading-relaxed text-muted">{issue.description}</p>
            </div>
          )}

          <div>
            <p className="label">Comments ({issue.comments?.length || 0})</p>
            <div className="mb-4 space-y-4">
              {issue.comments?.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[11px] font-bold text-accent">
                    {c.author.name[0]}
                  </span>
                  <div className="flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink">{c.author.name}</span>
                      <span className="text-xs text-faint">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postComment()}
                className="input"
                placeholder="Add a comment..."
              />
              <button
                onClick={postComment}
                disabled={posting || !comment.trim()}
                className="btn btn-primary shrink-0"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

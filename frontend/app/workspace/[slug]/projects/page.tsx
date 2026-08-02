"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, FolderOpen, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/auth";
import { STATUS_DOT, STATUSES, type Status } from "@/lib/status";
import Link from "next/link";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";

export default function ProjectsPage() {
  useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [billingStatus, setBillingStatus] = useState<any>(null);

  const fetchProjects = async () => {
    const res = await apiRequest(`/workspaces/${slug}/projects`);
    const data = await res.json();
    setProjects(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (!slug) return;
    fetchProjects();
    apiRequest(`/workspaces/${slug}/billing/status`)
      .then((r) => r.json())
      .then((d) => setBillingStatus(d));
  }, [slug]);

  useEffect(() => {
    if (slug) fetchProjects();
  }, [slug]);

  const createProject = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await apiRequest(`/workspaces/${slug}/projects`, {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setShowModal(false);
      setName("");
      setDescription("");
      fetchProjects();
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );

  const overLimit = billingStatus?.usage?.projects >= 5;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Projects
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>

      {/* Free plan limit banner */}
      {billingStatus?.plan === "FREE" && billingStatus?.usage?.projects >= 4 && (
        <div
          className={`mb-6 flex items-center justify-between gap-4 rounded-xl border px-5 py-4 ${
            overLimit
              ? "border-danger/25 bg-danger-tint"
              : "border-warn/25 bg-warn/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              className={`h-4 w-4 shrink-0 ${overLimit ? "text-danger" : "text-warn"}`}
            />
            <div>
              <p className={`text-sm font-semibold ${overLimit ? "text-danger" : "text-warn"}`}>
                {overLimit
                  ? "Project limit reached — upgrade to create more"
                  : `${5 - billingStatus.usage.projects} project slot${
                      5 - billingStatus.usage.projects !== 1 ? "s" : ""
                    } remaining on Free plan`}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Free plan allows 5 projects. Pro is unlimited.
              </p>
            </div>
          </div>
          <Link
            href={`/workspace/${slug}/billing`}
            className="btn btn-primary shrink-0"
          >
            Upgrade
          </Link>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card px-16 py-16 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-sand text-faint">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h3 className="font-display text-lg font-semibold text-ink">
            No projects yet
          </h3>
          <p className="mx-auto mb-6 mt-1 max-w-xs text-sm text-muted">
            Create your first project to start tracking issues.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Create project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => router.push(`/workspace/${slug}/projects/${project.id}`)}
              className="card group p-5 text-left transition-all hover:border-faint hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sand text-ink transition-colors group-hover:bg-accent-tint group-hover:text-accent">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-faint transition-colors group-hover:text-accent" />
              </div>
              <h3 className="text-sm font-semibold tracking-tight text-ink">
                {project.name}
              </h3>
              <p className="mb-3 font-mono text-xs text-faint">{project.identifier}</p>
              {project.description && (
                <p className="mb-3 truncate text-xs text-muted">{project.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                {STATUSES.map((s) => {
                  const count = project.statusCounts?.[s] as number | undefined;
                  if (!count) return null;
                  return (
                    <span key={s} className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s as Status]}`} />
                      <span className="text-xs text-muted">{count}</span>
                    </span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="New project"
          onClose={() => {
            setShowModal(false);
            setError("");
          }}
          footer={
            <>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={creating || !name.trim()}
                className="btn btn-primary flex-1"
              >
                {creating ? "Creating..." : "Create project"}
              </button>
            </>
          }
        >
          {error && (
            <div className="mb-4 rounded-lg border border-danger/25 bg-danger-tint px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="label">Project name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createProject()}
                className="input"
                placeholder="Engineering"
                autoFocus
              />
            </div>
            <div>
              <label className="label">
                Description <span className="font-normal normal-case text-faint">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                placeholder="What is this project for?"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

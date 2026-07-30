"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, FolderOpen, ArrowRight, X, Zap, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/auth";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-[#7d8590]",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-yellow-500",
  DONE: "bg-[#238636]",
  CANCELLED: "bg-red-500",
};

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
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#e6edf3] tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-[#7d8590] mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-full transition-colors text-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {/* FREE plan limit banner */}
{billingStatus?.plan === 'FREE' && billingStatus?.usage?.projects >= 4 && (
  <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border mb-6 ${
    billingStatus.usage.projects >= 5
      ? 'bg-red-500/10 border-red-500/30'
      : 'bg-orange-500/10 border-orange-500/30'
  }`}>
    <div className="flex items-center gap-3">
      <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
        billingStatus.usage.projects >= 5 ? 'text-red-400' : 'text-orange-500'
      }`} />
      <div>
        <p className={`text-sm font-bold ${
          billingStatus.usage.projects >= 5 ? 'text-red-400' : 'text-orange-500'
        }`}>
          {billingStatus.usage.projects >= 5
            ? 'Project limit reached — upgrade to create more'
            : `${5 - billingStatus.usage.projects} project slot${5 - billingStatus.usage.projects !== 1 ? 's' : ''} remaining on Free plan`
          }
        </p>
        <p className="text-xs text-[#7d8590] mt-0.5">Free plan allows 5 projects. Pro is unlimited.</p>
      </div>
    </div>
    <Link href={`/workspace/${slug}/billing`}
      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap">
      <Zap className="w-3 h-3" /> Upgrade
    </Link>
  </div>
)}

      {projects.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-[#0d1117] border border-[#30363d] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FolderOpen className="w-7 h-7 text-[#7d8590]" />
          </div>
          <h3 className="font-black text-[#e6edf3] text-lg mb-2">
            No projects yet
          </h3>
          <p className="text-[#7d8590] text-sm mb-6">
            Create your first project to start tracking issues.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors"
          >
            Create project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() =>
                router.push(`/workspace/${slug}/projects/${project.id}`)
              }
              className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 hover:border-orange-500/40 hover:bg-[#161b22] transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-orange-500" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#30363d] group-hover:text-orange-500 transition-colors" />
              </div>
              <h3 className="font-black text-[#e6edf3] text-sm mb-1 tracking-tight">
                {project.name}
              </h3>
              <p className="text-xs text-[#7d8590] mb-3 font-mono">
                {project.identifier}
              </p>
              {project.description && (
                <p className="text-xs text-[#7d8590] mb-3 truncate">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                {Object.entries(project.statusCounts || {}).map(
                  ([status, count]) =>
                    (count as number) > 0 ? (
                      <div key={status} className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`}
                        />
                        <span className="text-xs text-[#7d8590]">
                          {count as number}
                        </span>
                      </div>
                    ) : null,
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[#e6edf3] tracking-tight">
                New project
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="text-[#7d8590] hover:text-[#e6edf3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">
                  Project name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createProject()}
                  autoFocus
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Engineering"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7d8590] uppercase tracking-wide mb-1.5">
                  Description{" "}
                  <span className="text-[#7d8590] font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="What is this project for?"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="flex-1 border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] py-2.5 rounded-full text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={creating || !name.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-colors"
              >
                {creating ? "Creating..." : "Create project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

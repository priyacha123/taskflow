"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, FolderOpen, Users, Check, ArrowRight } from "lucide-react";
import { apiRequest, getCurrentWorkspace, setCurrentWorkspace } from "@/lib/auth";
import Logo from "@/components/Logo";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspace, setWorkspace] = useState<any>(null);
  const [projectName, setProjectName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getCurrentWorkspace();
    if (current) {
      setWorkspace(current);
      setWorkspaceName(current.name);
    }
  }, []);

  const saveWorkspace = async () => {
    if (!workspace) {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest(`/workspaces/${workspace.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ name: workspaceName }),
      });
      if (res.ok) {
        const d = await res.json();
        setWorkspace(d);
        setCurrentWorkspace({ ...d, role: "OWNER" });
      }
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      setStep(3);
      return;
    }
    setLoading(true);
    try {
      await apiRequest(`/workspaces/${workspace.slug}/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: "MEMBER" }),
      });
      setStep(3);
    } catch {
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest(`/workspaces/${workspace.slug}/projects`, {
        method: "POST",
        body: JSON.stringify({ name: projectName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push(`/workspace/${workspace.slug}/projects/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "Workspace", icon: <Zap className="h-3.5 w-3.5" /> },
    { label: "Team", icon: <Users className="h-3.5 w-3.5" /> },
    { label: "Project", icon: <FolderOpen className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>

        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-center">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors ${
                    step === i + 1
                      ? "border-accent bg-accent text-white"
                      : step > i + 1
                        ? "border-accent bg-accent-tint text-accent"
                        : "border-line bg-surface text-faint"
                  }`}
                >
                  {step > i + 1 ? <Check className="h-4 w-4" /> : s.icon}
                </span>
                <span
                  className={`mt-1.5 text-[11px] font-medium ${
                    step === i + 1 ? "text-ink" : "text-faint"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={`mx-2 mb-5 h-px w-8 ${
                    step > i + 1 ? "bg-accent/40" : "bg-line"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="card p-7 shadow-sm">
          {step === 1 && (
            <div>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-tint text-accent">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Name your workspace
              </h2>
              <p className="mt-1 mb-6 text-sm leading-relaxed text-muted">
                This is how your team identifies this workspace.
              </p>
              <div className="mb-6">
                <label className="label">Workspace name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveWorkspace()}
                  className="input"
                  placeholder="Acme Corp"
                  autoFocus
                />
              </div>
              <button
                onClick={saveWorkspace}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Saving..." : (
                  <>
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Invite your team
              </h2>
              <p className="mt-1 mb-6 text-sm leading-relaxed text-muted">
                Add teammates to your workspace. Skip this if you want to do it
                later.
              </p>
              <div className="mb-6">
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                  className="input"
                  placeholder="teammate@company.com"
                />
              </div>
              <button
                onClick={sendInvite}
                disabled={loading}
                className="btn btn-primary mb-3 w-full"
              >
                {loading ? "Sending..." : (
                  <>
                    Send invite <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn btn-ghost w-full"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-tint text-accent">
                <FolderOpen className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Create your first project
              </h2>
              <p className="mt-1 mb-6 text-sm leading-relaxed text-muted">
                Projects hold your kanban board and issues.
              </p>
              {error && (
                <div className="mb-4 rounded-lg border border-danger/25 bg-danger-tint px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              )}
              <div className="mb-6">
                <label className="label">Project name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createProject()}
                  className="input"
                  placeholder="Engineering"
                  autoFocus
                />
              </div>
              <button
                onClick={createProject}
                disabled={loading || !projectName.trim()}
                className="btn btn-primary w-full"
              >
                {loading ? "Creating..." : (
                  <>
                    Create project <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

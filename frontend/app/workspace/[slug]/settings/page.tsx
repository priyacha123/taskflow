"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, removeToken } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";
import Spinner from "@/components/Spinner";

export default function SettingsPage() {
  useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [workspace, setWorkspace] = useState<any>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!slug) return;
    apiRequest(`/workspaces/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setWorkspace(d);
        setName(d.name);
      });
  }, [slug]);

  const saveName = async () => {
    if (!name.trim() || name === workspace?.name) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiRequest(`/workspaces/${slug}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setWorkspace(data);
      setSuccess("Workspace name updated");
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkspace = async () => {
    if (deleteConfirm !== workspace?.name) return;
    setDeleting(true);
    try {
      const res = await apiRequest(`/workspaces/${slug}`, { method: "DELETE" });
      if (res.ok) {
        removeToken();
        router.push("/");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!workspace)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );

  const isOwner = workspace.role === "OWNER";

  return (
    <div className="max-w-2xl p-6 md:p-8">
      <h1 className="mb-8 font-display text-2xl font-semibold tracking-tight text-ink">
        Settings
      </h1>

      <div className="card mb-6 p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Workspace name</h2>
        {success && (
          <div className="mb-4 rounded-lg border border-accent/25 bg-accent-tint px-4 py-3 text-sm text-accent">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-danger/25 bg-danger-tint px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            disabled={!isOwner}
            className="input flex-1"
          />
          {isOwner && (
            <button
              onClick={saveName}
              disabled={saving || name === workspace.name}
              className="btn btn-primary shrink-0"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          Slug: <span className="font-mono text-ink">{workspace.slug}</span>
        </p>
      </div>

      {isOwner && (
        <div className="card border-danger/30 p-6">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
          </div>
          <p className="mb-4 text-xs text-muted">
            Permanently deletes this workspace, all projects, issues, and members. This
            cannot be undone.
          </p>
          <div className="mb-4">
            <label className="label">
              Type <span className="font-mono font-bold text-ink">{workspace.name}</span> to
              confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="input border-danger/30 focus:border-danger focus:ring-danger/15"
              placeholder={workspace.name}
            />
          </div>
          <button
            onClick={deleteWorkspace}
            disabled={deleteConfirm !== workspace.name || deleting}
            className="btn btn-danger"
          >
            {deleting ? "Deleting..." : "Delete workspace"}
          </button>
        </div>
      )}
    </div>
  );
}

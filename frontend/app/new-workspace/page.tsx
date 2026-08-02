"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { apiRequest, setCurrentWorkspace, getWorkspaces, setWorkspaces } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import AuthCard from "@/components/AuthCard";

export default function NewWorkspacePage() {
  useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/workspaces", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      const updated = [...getWorkspaces(), { ...data, role: "OWNER" }];
      setWorkspaces(updated);
      setCurrentWorkspace({ ...data, role: "OWNER" });
      router.push(`/workspace/${data.slug}/projects`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="New workspace"
      subtitle="Create a workspace for a different team or client."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-danger/25 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      <div className="mb-5">
        <label className="label">Workspace name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="input"
          placeholder="My new workspace"
          autoFocus
        />
      </div>
      <button
        onClick={handleCreate}
        disabled={loading || !name.trim()}
        className="btn btn-primary w-full"
      >
        {loading ? "Creating..." : (
          <>
            Create workspace <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </AuthCard>
  );
}

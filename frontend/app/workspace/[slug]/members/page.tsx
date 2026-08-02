"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserPlus, Trash2, Crown, Shield, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/auth";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";

const ROLE_CONFIG: Record<string, { className: string; icon: any }> = {
  OWNER: { className: "border-accent/25 bg-accent-tint text-accent", icon: Crown },
  ADMIN: { className: "border-info/25 bg-info/10 text-info", icon: Shield },
  MEMBER: { className: "border-line bg-sand text-muted", icon: User },
};

export default function MembersPage() {
  useAuth();
  const params = useParams();
  const slug = params?.slug as string;
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

  const fetchMembers = async () => {
    const res = await apiRequest(`/workspaces/${slug}/members`);
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    if (!slug) return;
    fetchMembers();
    apiRequest(`/workspaces/${slug}`)
      .then((r) => r.json())
      .then((d) => setCurrentUserRole(d.role || ""));
  }, [slug]);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiRequest(`/workspaces/${slug}/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvite(false);
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm("Remove this member?")) return;
    await apiRequest(`/workspaces/${slug}/members/${userId}`, { method: "DELETE" });
    fetchMembers();
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );

  const canManage = ["OWNER", "ADMIN"].includes(currentUserRole);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Members
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <button onClick={() => setShowInvite(true)} className="btn btn-primary">
            <UserPlus className="h-4 w-4" /> Invite member
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 rounded-lg border border-accent/25 bg-accent-tint px-4 py-3 text-sm text-accent">
          {success}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="divide-y divide-line">
          {members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.MEMBER;
            const RoleIcon = roleConfig.icon;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-sand/40"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-tint text-sm font-bold text-accent">
                    {member.user.name[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{member.user.name}</p>
                    <p className="text-xs text-muted">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`chip ${roleConfig.className}`}>
                    <RoleIcon className="h-3 w-3" />
                    {member.role}
                  </span>
                  <span className="hidden text-xs text-faint sm:block">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                  {canManage && member.role !== "OWNER" && (
                    <button
                      onClick={() => removeMember(member.userId)}
                      className="rounded-md p-1 text-faint transition-colors hover:bg-danger-tint hover:text-danger"
                      aria-label={`Remove ${member.user.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showInvite && (
        <Modal
          title="Invite member"
          onClose={() => {
            setShowInvite(false);
            setError("");
          }}
          footer={
            <>
              <button
                onClick={() => {
                  setShowInvite(false);
                  setError("");
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={sendInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="btn btn-primary flex-1"
              >
                {inviting ? "Sending..." : "Send invite"}
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
              <label className="label">Email address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                className="input"
                placeholder="teammate@company.com"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="input"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

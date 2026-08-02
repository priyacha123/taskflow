// app/invite/accept/accept-invite-client.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { getToken } from "@/lib/auth";
import Logo from "@/components/Logo";
import Spinner from "@/components/Spinner";

export default function InviteAcceptClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "register">("loading");
  const [message, setMessage] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid invitation link.");
      return;
    }
    acceptInvite();
  }, [token]);

  const acceptInvite = async () => {
    try {
      const userToken = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (userToken) headers["Authorization"] = `Bearer ${userToken}`;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invite/accept?token=${token}`,
        { headers }
      );
      const data = await res.json();

      if (data.requiresRegistration) {
        setInviteEmail(data.email);
        setWorkspaceName(data.workspaceName);
        setWorkspaceSlug(data.workspaceSlug);
        setStatus("register");
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to accept invitation");
        return;
      }

      setWorkspaceSlug(data.workspaceSlug);
      setStatus("success");
      setMessage("You have joined the workspace!");

      setTimeout(() => router.push(`/workspace/${data.workspaceSlug}/projects`), 2000);
    } catch {
      setStatus("error");
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="TaskFlow home">
            <Logo />
          </Link>
        </div>

        <div className="card p-7 text-center shadow-sm">
          {status === "loading" && (
            <>
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-sm text-muted">Processing your invitation...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-tint text-accent">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Invitation accepted!
              </h2>
              <p className="mb-6 mt-1 text-sm text-muted">{message}</p>
              <Link href={`/workspace/${workspaceSlug}/projects`} className="btn btn-primary w-full">
                Go to workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-tint text-danger">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Invitation failed
              </h2>
              <p className="mb-6 mt-1 text-sm text-muted">{message}</p>
              <Link href="/login" className="btn btn-primary w-full">
                Go to login <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}

          {status === "register" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-accent-tint text-accent">
                <Zap className="h-7 w-7" />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                You&apos;re invited!
              </h2>
              <p className="mt-1 text-sm text-muted">
                You&apos;ve been invited to join{" "}
                <span className="font-semibold text-ink">{workspaceName}</span>.
              </p>
              <p className="mb-6 mt-1 text-sm text-muted">
                Create an account with{" "}
                <span className="font-medium text-accent">{inviteEmail}</span> to accept.
              </p>
              <Link
                href={`/register?email=${encodeURIComponent(inviteEmail)}&token=${token}`}
                className="btn btn-primary mb-3 w-full"
              >
                Create account <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/login?token=${token}`}
                className="btn btn-secondary w-full"
              >
                Sign in instead
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

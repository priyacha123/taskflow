"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { setToken, setWorkspaces, setCurrentWorkspace, apiRequest } from "@/lib/auth";
import AuthCard from "@/components/AuthCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      setToken(data.token);
      setWorkspaces(data.workspaces);
      const ws = data.workspaces[0];
      if (ws) {
        setCurrentWorkspace(ws);
        router.push(`/workspace/${ws.slug}/projects`);
      } else router.push("/onboarding");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-accent hover:text-accent-dark">
            Sign up free
          </Link>
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
          <label className="label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="input"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn btn-primary mt-5 w-full"
      >
        {loading ? "Signing in..." : (
          <>
            Sign in <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </AuthCard>
  );
}

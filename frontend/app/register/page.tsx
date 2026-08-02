"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { setToken, setWorkspaces, setCurrentWorkspace, apiRequest } from "@/lib/auth";
import AuthCard from "@/components/AuthCard";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setToken(data.token);
      setWorkspaces([{ ...data.workspace, role: "OWNER" }]);
      setCurrentWorkspace({ ...data.workspace, role: "OWNER" });
      router.push("/onboarding");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full name", value: name, set: setName, type: "text", placeholder: "Priya Kumari" },
    { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@example.com" },
    { label: "Password", value: password, set: setPassword, type: "password", placeholder: "Min. 6 characters" },
  ];

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free forever. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent-dark">
            Sign in
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
        {fields.map((f) => (
          <div key={f.label}>
            <label className="label">{f.label}</label>
            <input
              type={f.type}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="input"
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn btn-primary mt-5 w-full"
      >
        {loading ? "Creating account..." : (
          <>
            Create account <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </AuthCard>
  );
}

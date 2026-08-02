"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Check, AlertTriangle, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/auth";
import Spinner from "@/components/Spinner";

export default function BillingPage() {
  useAuth();
  const params = useParams();
  const slug = params?.slug as string;
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setSuccessMessage("You are now on the Pro plan! All limits have been lifted.");
      window.history.replaceState({}, "", `/workspace/${slug}/billing`);

      // The Stripe webhook that flips the workspace to PRO can arrive a moment
      // after the redirect back to the app. Poll so the page shows the upgraded
      // plan instead of "Starter" underneath a success message.
      let attempts = 0;
      const poll = async () => {
        if (attempts >= 5) return;
        attempts += 1;
        const res = await apiRequest(`/workspaces/${slug}/billing/status`);
        if (!res.ok) {
          setTimeout(poll, 1000);
          return;
        }
        const data = await res.json();
        setBilling(data);
        if (data?.plan !== "PRO") setTimeout(poll, 1000);
      };
      poll();
    }
  }, [searchParams, slug]);

  const fetchBilling = async () => {
    const res = await apiRequest(`/workspaces/${slug}/billing/status`);
    if (res.ok) {
      setBilling(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (slug) fetchBilling();
  }, [slug]);

  const handleUpgrade = async () => {
    setProcessing(true);
    setError("");
    try {
      const res = await apiRequest(`/workspaces/${slug}/billing/checkout`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      window.location.href = data.url;
    } finally {
      setProcessing(false);
    }
  };

  const handlePortal = async () => {
    setProcessing(true);
    try {
      const res = await apiRequest(`/workspaces/${slug}/billing/portal`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) window.location.href = data.url;
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );

  const isPro = billing?.plan === "PRO";

  return (
    <div className="w-full p-6 md:p-8">
      <h1 className="mb-8 font-display text-2xl font-semibold tracking-tight text-ink">
        Billing
      </h1>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/25 bg-danger-tint p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-accent/25 bg-accent-tint p-4">
          <Check className="h-4 w-4 shrink-0 text-accent" />
          <p className="text-sm font-medium text-accent">{successMessage}</p>
        </div>
      )}

      <div className="card mb-6 p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
              Current plan
            </p>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                {isPro ? "Pro" : "Starter"}
              </h2>
              {isPro && <Crown className="h-5 w-5 text-accent" />}
              <span
                className={`chip capitalize ${
                  isPro
                    ? "border-accent/25 bg-accent-tint text-accent"
                    : "border-line bg-sand text-muted"
                }`}
              >
                {billing?.subscriptionStatus}
              </span>
            </div>
            <p className="text-sm text-muted">{isPro ? "$12/month" : "$0/forever"}</p>
          </div>

          {!isPro ? (
            <button
              onClick={handleUpgrade}
              disabled={processing}
              className="btn btn-primary"
            >
              {processing ? "Loading..." : "Upgrade to Pro"}
            </button>
          ) : (
            <button
              onClick={handlePortal}
              disabled={processing}
              className="btn btn-secondary"
            >
              {processing ? "Loading..." : "Manage subscription"}
            </button>
          )}
        </div>

        <div className="space-y-4 border-t border-line pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-faint">Usage</p>
          {[
            { label: "Projects", used: billing?.usage?.projects, limit: billing?.limits?.projects, max: 5 },
            { label: "Members", used: billing?.usage?.members, limit: billing?.limits?.members, max: 10 },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted">{item.label}</span>
                <span className="font-semibold text-ink">
                  {item.used} / {item.limit}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
                <div
                  className="h-2 rounded-full bg-accent transition-all"
                  style={{
                    width: isPro
                      ? "10%"
                      : `${Math.min((item.used / item.max) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isPro && (
        <div className="card border-accent/30 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-ink">Pro plan includes</p>
          </div>
          <ul className="mb-6 space-y-3">
            {[
              "Unlimited projects",
              "Unlimited members",
              "Advanced analytics",
              "Priority support",
              "Custom labels",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-muted">
                <Check className="h-4 w-4 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={processing}
            className="btn btn-primary w-full"
          >
            {processing ? "Loading..." : "Upgrade to Pro — $12/month"}
          </button>
        </div>
      )}
    </div>
  );
}

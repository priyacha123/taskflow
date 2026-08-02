"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWorkspaces, getCurrentWorkspace, isAuthenticated } from "@/lib/auth";
import Spinner from "@/components/Spinner";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const current = getCurrentWorkspace();
    if (current?.slug) {
      router.push(`/workspace/${current.slug}/projects`);
      return;
    }

    const workspaces = getWorkspaces();
    if (workspaces.length > 0) {
      router.push(`/workspace/${workspaces[0].slug}/projects`);
      return;
    }

    router.push("/onboarding");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Spinner />
    </div>
  );
}

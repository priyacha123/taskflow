"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function WorkspaceIndexPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) router.replace(`/workspace/${slug}/projects`);
  }, [slug, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Spinner />
    </div>
  );
}

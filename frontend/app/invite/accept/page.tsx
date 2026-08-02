// app/invite/accept/page.tsx
import { Suspense } from "react";
import InviteAcceptClient from "./accept-invite-client";
import Spinner from "@/components/Spinner";

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<InviteAcceptFallback />}>
      <InviteAcceptClient />
    </Suspense>
  );
}

function InviteAcceptFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <Spinner size="lg" />
    </div>
  );
}

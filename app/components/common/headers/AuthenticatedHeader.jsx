import { Suspense } from "react";
import { getVisitorProfile } from "@/app/lib/api/visitor";
import Header from "./Header";

async function AuthenticatedHeaderContent() {
  const visitor = await getVisitorProfile();

  return <Header isAuthenticated={Boolean(visitor)} />;
}

export default function AuthenticatedHeader() {
  return (
    <Suspense fallback={<Header isAuthenticated={false} />}>
      <AuthenticatedHeaderContent />
    </Suspense>
  );
}

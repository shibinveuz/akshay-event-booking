import { redirect } from "next/navigation";
import VisitorPortal from "@/app/widgets/visitor/VisitorPortal";
import { getVisitorProfile } from "@/app/lib/api/visitor";

export const metadata = {
  title: "Visitor Portal | GITEX NIGERIA 2026",
  description: "Manage your GITEX Nigeria registration and visitor details.",
};

export const dynamic = "force-dynamic";

export default async function VisitorPortalPage() {
  const visitor = await getVisitorProfile();

  if (!visitor) {
    redirect("/login");
  }

  return <VisitorPortal visitor={visitor} />;
}

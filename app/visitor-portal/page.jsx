import { redirect } from "next/navigation";
import VisitorPortal from "@/app/widgets/visitor/VisitorPortal";
import {
  getVisitorHistory,
  getVisitorProfile,
} from "@/app/lib/api/visitor";
import { getVisaCountries } from "@/app/lib/api/registration";

export const metadata = {
  title: "Visitor Portal | GITEX NIGERIA 2026",
  description: "Manage your GITEX Nigeria registration and visitor details.",
};

export const dynamic = "force-dynamic";

export default async function VisitorPortalPage() {
  const [visitor, history, countries] = await Promise.all([
    getVisitorProfile(),
    getVisitorHistory(),
    getVisaCountries().catch(() => []),
  ]);

  if (!visitor) {
    redirect("/login");
  }

  return (
    <VisitorPortal visitor={visitor} history={history} countries={countries} />
  );
}

import { redirect } from "next/navigation";
import Login from "@/app/widgets/auth/Login";
import { getVisitorProfile } from "@/app/lib/api/visitor";

export const metadata = {
  title: "Login | GITEX NIGERIA 2026",
  description: "Secure login with one-time password.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const visitor = await getVisitorProfile();

  if (visitor) {
    redirect("/visitor-portal");
  }

  return <Login />;
}

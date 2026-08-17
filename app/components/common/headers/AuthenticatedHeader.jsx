import { cookies } from "next/headers";
import { VISITOR_ACCESS_COOKIE } from "@/app/lib/auth-cookies";
import Header from "./Header";

export default async function AuthenticatedHeader() {
  const cookieStore = await cookies();

  return <Header isAuthenticated={cookieStore.has(VISITOR_ACCESS_COOKIE)} />;
}

import { getVisitorProfile } from "@/app/lib/api/visitor";
import Header from "./Header";

export default async function AuthenticatedHeader() {
  const visitor = await getVisitorProfile();

  return <Header isAuthenticated={Boolean(visitor)} />;
}

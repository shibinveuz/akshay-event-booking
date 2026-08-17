import { proxyConfirmationDownload } from "@/app/lib/api/confirmation";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { kind } = await params;
  const searchParams = new URL(request.url).searchParams;

  return proxyConfirmationDownload(
    kind,
    searchParams.get("id"),
    searchParams.get("token"),
  );
}

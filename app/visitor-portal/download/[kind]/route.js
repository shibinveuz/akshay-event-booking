import { cookies } from "next/headers";
import { VISITOR_ACCESS_COOKIE } from "@/app/lib/auth-cookies";
import { getVisitorUid } from "@/app/lib/api/visitor";

const DOWNLOAD_PATHS = {
  confirmation: "microsite/v1/download-confirmation-email-template",
  visa: "microsite/v1/generate-visa-details-pdf",
};

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { kind } = await params;
  const endpoint = DOWNLOAD_PATHS[kind];
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(VISITOR_ACCESS_COOKIE)?.value;

  if (!endpoint) {
    return Response.json({ message: "Invalid download request." }, { status: 400 });
  }
  if (!accessToken) {
    return Response.json({ message: "Authentication required." }, { status: 401 });
  }

  // Resolve the visitor UID from the authenticated session — never from the URL.
  const uid = await getVisitorUid();
  if (!uid) {
    return Response.json({ message: "Visitor session could not be resolved." }, { status: 401 });
  }

  const baseUrl = process.env.BACKEND_BASE_URL;
  if (!baseUrl) {
    return Response.json({ message: "Backend is not configured." }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/${endpoint}/${encodeURIComponent(uid)}`,
      {
        headers: {
          // Let the backend choose its renderer. Its download endpoints return
          // 406 when constrained to text/html or application/pdf.
          Accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );
    const body = await response.arrayBuffer();
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");
    if (contentType) headers.set("content-type", contentType);
    if (contentDisposition) {
      headers.set("content-disposition", contentDisposition);
    } else if (response.ok) {
      headers.set(
        "content-disposition",
        `attachment; filename="${
          kind === "visa" ? "visa-invitation.pdf" : "confirmation-email.html"
        }"`,
      );
    }
    headers.set("cache-control", "private, no-store");

    return new Response(body, { status: response.status, headers });
  } catch (error) {
    console.error("Visitor download proxy failed:", error);
    return Response.json({ message: "Download service unavailable." }, { status: 502 });
  }
}

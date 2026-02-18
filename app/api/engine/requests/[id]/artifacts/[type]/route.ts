import { NextRequest, NextResponse } from "next/server";

import { engineOfflineResponse, fetchEngine, withRateLimit } from "@/lib/server/engineProxy";

type RouteContext = {
  params: Promise<{ id: string; type: string }>;
};

const ALLOWED_ARTIFACT_TYPES = new Set(["json", "csv", "pdf"]);

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = withRateLimit(request, "get-artifact");
  if (limited) {
    return limited;
  }

  const { id, type } = await context.params;

  if (!ALLOWED_ARTIFACT_TYPES.has(type)) {
    return NextResponse.json(
      {
        error: "Unsupported artifact type.",
        code: "INVALID_ARTIFACT_TYPE",
      },
      { status: 400 },
    );
  }

  const response = await fetchEngine(`/v1/requests/${id}/artifacts/${type}`);
  if (!response) {
    return engineOfflineResponse();
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Artifact is not available yet.",
        code: "ARTIFACT_UNAVAILABLE",
      },
      { status: response.status },
    );
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const contentDisposition = response.headers.get("content-disposition");
  const cacheControl = response.headers.get("cache-control");

  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (contentDisposition) {
    headers.set("content-disposition", contentDisposition);
  }
  if (cacheControl) {
    headers.set("cache-control", cacheControl);
  }

  return new NextResponse(response.body, {
    status: 200,
    headers,
  });
}

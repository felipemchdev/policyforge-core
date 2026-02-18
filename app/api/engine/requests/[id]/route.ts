import { NextRequest, NextResponse } from "next/server";

import { engineRequestStatusSchema } from "@/schemas/engine";
import {
  coerceId,
  coerceStatus,
  fetchEngine,
  proxyEngineError,
  readJsonSafe,
  responseForEngineFetchFailure,
  withRateLimit,
} from "@/lib/server/engineProxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = withRateLimit(request, "get-request");
  if (limited) {
    return limited;
  }

  const { id } = await context.params;
  const engineCall = await fetchEngine(`/v1/requests/${id}`);

  if (!engineCall.ok) {
    return responseForEngineFetchFailure(engineCall.failure);
  }

  const { response } = engineCall;
  if (!response.ok) {
    return proxyEngineError(response);
  }

  const engineData = await readJsonSafe(response);
  const candidate = engineData as Record<string, unknown> | null;

  const normalized = engineRequestStatusSchema.parse({
    id: coerceId(engineData, id),
    status: coerceStatus(engineData, "running"),
    submitted_at:
      candidate && typeof candidate.submitted_at === "string" ? candidate.submitted_at : undefined,
    updated_at:
      candidate && typeof candidate.updated_at === "string" ? candidate.updated_at : undefined,
  });

  return NextResponse.json(normalized);
}

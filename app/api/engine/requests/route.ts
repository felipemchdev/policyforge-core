import { NextRequest, NextResponse } from "next/server";

import {
  createEngineRequestInputSchema,
  createEngineRequestResponseSchema,
} from "@/schemas/engine";
import {
  coerceId,
  coerceStatus,
  fetchEngine,
  proxyEngineError,
  readJsonSafe,
  responseForEngineFetchFailure,
  withRateLimit,
} from "@/lib/server/engineProxy";

export async function POST(request: NextRequest) {
  const limited = withRateLimit(request, "create-request");
  if (limited) {
    return limited;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body.",
        code: "INVALID_BODY",
      },
      { status: 400 },
    );
  }

  const parsed = createEngineRequestInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Request body does not match the required schema.",
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const engineCall = await fetchEngine("/v1/requests", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(parsed.data),
  });

  if (!engineCall.ok) {
    return responseForEngineFetchFailure(engineCall.failure);
  }

  const { response } = engineCall;
  if (!response.ok) {
    return proxyEngineError(response);
  }

  const engineData = await readJsonSafe(response);
  const normalized = createEngineRequestResponseSchema.parse({
    id: coerceId(engineData, "unknown"),
    status: coerceStatus(engineData, "submitted"),
  });

  return NextResponse.json(normalized, { status: 201 });
}

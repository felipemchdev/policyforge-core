import { NextRequest, NextResponse } from "next/server";

import { engineRequestResultSchema } from "@/schemas/engine";
import {
  coerceId,
  engineOfflineResponse,
  fetchEngine,
  proxyEngineError,
  readJsonSafe,
  withRateLimit,
} from "@/lib/server/engineProxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function coerceReasons(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const rawReasons = (payload as Record<string, unknown>).reasons;
  if (!Array.isArray(rawReasons)) {
    return [];
  }

  return rawReasons
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item === "object") {
        const message =
          (item as Record<string, unknown>).message ??
          (item as Record<string, unknown>).reason ??
          (item as Record<string, unknown>).code;
        if (typeof message === "string") {
          return message;
        }
      }
      return null;
    })
    .filter((reason): reason is string => Boolean(reason));
}

function coerceDecision(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "unknown";
  }

  const decision =
    (payload as Record<string, unknown>).decision ??
    ((payload as Record<string, unknown>).result as Record<string, unknown>)?.decision;
  if (typeof decision === "string" && decision.trim().length > 0) {
    return decision;
  }
  return "unknown";
}

function coerceComputedFields(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const direct = (payload as Record<string, unknown>).computed_fields;
  if (direct && typeof direct === "object") {
    return direct as Record<string, unknown>;
  }

  const nested = ((payload as Record<string, unknown>).result as Record<string, unknown>)
    ?.computed_fields;
  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }

  return {};
}

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = withRateLimit(request, "get-result");
  if (limited) {
    return limited;
  }

  const { id } = await context.params;
  const response = await fetchEngine(`/v1/requests/${id}/result`);

  if (!response) {
    return engineOfflineResponse();
  }

  if (!response.ok) {
    return proxyEngineError(response);
  }

  const engineData = await readJsonSafe(response);
  const normalized = engineRequestResultSchema.parse({
    id: coerceId(engineData, id),
    decision: coerceDecision(engineData),
    reasons: coerceReasons(engineData),
    computed_fields: coerceComputedFields(engineData),
  });

  return NextResponse.json(normalized);
}

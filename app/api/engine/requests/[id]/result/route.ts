import { NextRequest, NextResponse } from "next/server";

import { engineRequestResultSchema } from "@/schemas/engine";
import {
  coerceId,
  fetchEngine,
  proxyEngineError,
  readJsonSafe,
  responseForEngineFetchFailure,
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

function coerceArtifacts(payload: unknown) {
  const artifactSource = (payload &&
    typeof payload === "object" &&
    ((payload as Record<string, unknown>).artifacts ??
      ((payload as Record<string, unknown>).result as Record<string, unknown> | undefined)
        ?.artifacts)) as unknown;

  if (!artifactSource || typeof artifactSource !== "object") {
    return undefined;
  }

  const normalized: Record<string, { signed_url?: string; endpoint?: string }> = {};

  for (const [key, value] of Object.entries(artifactSource as Record<string, unknown>)) {
    if (typeof value === "string") {
      normalized[key] = /^https?:\/\//i.test(value) ? { signed_url: value } : { endpoint: value };
      continue;
    }

    if (!value || typeof value !== "object") {
      continue;
    }

    const candidate = value as Record<string, unknown>;
    const signedUrl = typeof candidate.signed_url === "string" ? candidate.signed_url : undefined;
    const endpoint = typeof candidate.endpoint === "string" ? candidate.endpoint : undefined;

    if (signedUrl || endpoint) {
      normalized[key] = {
        signed_url: signedUrl,
        endpoint,
      };
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = withRateLimit(request, "get-result");
  if (limited) {
    return limited;
  }

  const { id } = await context.params;
  const engineCall = await fetchEngine(`/v1/requests/${id}/result`);

  if (!engineCall.ok) {
    return responseForEngineFetchFailure(engineCall.failure);
  }

  const { response } = engineCall;
  if (!response.ok) {
    return proxyEngineError(response);
  }

  const engineData = await readJsonSafe(response);
  const normalized = engineRequestResultSchema.parse({
    id: coerceId(engineData, id),
    decision: coerceDecision(engineData),
    reasons: coerceReasons(engineData),
    computed_fields: coerceComputedFields(engineData),
    artifacts: coerceArtifacts(engineData),
  });

  return NextResponse.json(normalized);
}

import { NextRequest, NextResponse } from "next/server";

import { getEngineBaseUrl, getEnvironment } from "@/lib/config";
import { checkRateLimit } from "@/lib/server/rateLimit";

const ENGINE_TIMEOUT_MS = 8_000;
const DEGRADE_THRESHOLD_MS = 1_200;
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

type EngineErrorPayload = {
  error: string;
  code?: string;
  instructions?: string[];
  technical_status?: string;
};

type EngineFetchFailure = {
  kind: "not_configured" | "network_error" | "timeout";
  message: string;
};

export type EngineFetchResult =
  | { ok: true; response: Response; durationMs: number }
  | { ok: false; failure: EngineFetchFailure; durationMs: number };

function nowMs() {
  return Date.now();
}

function elapsedMs(startedAt: number) {
  return nowMs() - startedAt;
}

function notConfiguredInstructions() {
  return [
    "Set NEXT_PUBLIC_ENGINE_URL in .env.local.",
    "Set NEXT_PUBLIC_ENVIRONMENT to dev, qa, or prod.",
    "Configure both variables in Vercel project environment settings.",
  ];
}

export function buildEngineUrl(path: string) {
  void getEnvironment();
  const baseUrl = getEngineBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export function getClientIdentifier(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "anonymous";
}

export function withRateLimit(request: NextRequest, scope: string) {
  const key = `${scope}:${getClientIdentifier(request)}`;
  const result = checkRateLimit(key, {
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded for engine proxy.",
        code: "RATE_LIMITED",
        technical_status: "TOO_MANY_REQUESTS",
      } satisfies EngineErrorPayload,
      {
        status: 429,
        headers: {
          "x-ratelimit-remaining": String(result.remaining),
          "x-ratelimit-reset": String(result.resetAt),
        },
      },
    );
  }

  return null;
}

export function engineNotConfiguredResponse() {
  return NextResponse.json(
    {
      error: "Engine not configured",
      code: "ENGINE_NOT_CONFIGURED",
      technical_status: "CONFIGURATION_ERROR",
      instructions: notConfiguredInstructions(),
    } satisfies EngineErrorPayload,
    { status: 503 },
  );
}

export function engineUnreachableResponse() {
  return NextResponse.json(
    {
      error: "Engine unreachable",
      code: "ENGINE_UNREACHABLE",
      technical_status: "NETWORK_ERROR",
    } satisfies EngineErrorPayload,
    { status: 503 },
  );
}

export function engineTimeoutResponse() {
  return NextResponse.json(
    {
      error: "Engine timeout",
      code: "ENGINE_TIMEOUT",
      technical_status: "TIMEOUT",
    } satisfies EngineErrorPayload,
    { status: 504 },
  );
}

export function responseForEngineFetchFailure(failure: EngineFetchFailure) {
  if (failure.kind === "not_configured") {
    return engineNotConfiguredResponse();
  }
  if (failure.kind === "timeout") {
    return engineTimeoutResponse();
  }
  return engineUnreachableResponse();
}

export async function fetchEngine(path: string, init?: RequestInit): Promise<EngineFetchResult> {
  const startedAt = nowMs();

  let url: string;
  try {
    url = buildEngineUrl(path);
  } catch (error) {
    return {
      ok: false,
      failure: {
        kind: "not_configured",
        message: error instanceof Error ? error.message : "Engine not configured.",
      },
      durationMs: elapsedMs(startedAt),
    };
  }

  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(ENGINE_TIMEOUT_MS),
      headers: {
        accept: "application/json, text/plain, */*",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    return {
      ok: true,
      response,
      durationMs: elapsedMs(startedAt),
    };
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    return {
      ok: false,
      failure: {
        kind: isTimeout ? "timeout" : "network_error",
        message: isTimeout ? "Engine timeout" : "Engine unreachable",
      },
      durationMs: elapsedMs(startedAt),
    };
  }
}

export async function readJsonSafe(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function normalizeEngineError(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "Engine returned error";
  }

  const message =
    (payload as Record<string, unknown>).error ?? (payload as Record<string, unknown>).message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  return "Engine returned error";
}

export async function proxyEngineError(response: Response) {
  const payload = await readJsonSafe(response);
  const isServerError = response.status >= 500;
  const errorMessage = isServerError
    ? `Engine returned error (${response.status})`
    : normalizeEngineError(payload);

  return NextResponse.json(
    {
      error: errorMessage,
      code: isServerError ? "ENGINE_5XX" : "ENGINE_ERROR",
      technical_status: isServerError ? "SERVER_ERROR" : "REQUEST_ERROR",
    } satisfies EngineErrorPayload,
    { status: response.status },
  );
}

export function coerceId(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidate =
    (payload as Record<string, unknown>).id ??
    (payload as Record<string, unknown>).request_id ??
    (payload as Record<string, unknown>).requestId;

  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }

  return fallback;
}

export function coerceStatus(payload: unknown, fallback = "submitted") {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidate =
    (payload as Record<string, unknown>).status ?? (payload as Record<string, unknown>).state;

  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }

  return fallback;
}

export function getHealthStateFromLatency(durationMs: number) {
  return durationMs > DEGRADE_THRESHOLD_MS ? "degraded" : "online";
}

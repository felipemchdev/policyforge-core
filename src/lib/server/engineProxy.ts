import { NextRequest, NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/server/rateLimit";

const DEFAULT_ENGINE_URL = "http://localhost:8000";
const ENGINE_TIMEOUT_MS = 8_000;
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

type EngineErrorPayload = {
  error: string;
  code?: string;
  instructions?: string[];
};

function ensureEngineBaseUrl() {
  const configured = process.env.ENGINE_URL?.trim();
  const value = configured && configured.length > 0 ? configured : DEFAULT_ENGINE_URL;
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function buildEngineUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${ensureEngineBaseUrl()}${normalizedPath}`;
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
        error: "Too many requests. Please wait and try again.",
        code: "RATE_LIMITED",
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

export function engineOfflineResponse() {
  return NextResponse.json(
    {
      error: "Engine offline",
      code: "ENGINE_OFFLINE",
      instructions: [
        "Set ENGINE_URL in .env.local (example: ENGINE_URL=http://localhost:8000).",
        "For Vercel, add ENGINE_URL in Project Settings > Environment Variables.",
      ],
    } satisfies EngineErrorPayload,
    { status: 503 },
  );
}

export async function fetchEngine(path: string, init?: RequestInit): Promise<Response | null> {
  const url = buildEngineUrl(path);
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
    return response;
  } catch {
    return null;
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
    return "Engine request failed.";
  }

  const message =
    (payload as Record<string, unknown>).error ?? (payload as Record<string, unknown>).message;

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return "Engine request failed.";
}

export async function proxyEngineError(response: Response) {
  const payload = await readJsonSafe(response);
  return NextResponse.json(
    {
      error: normalizeEngineError(payload),
      code: "ENGINE_ERROR",
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

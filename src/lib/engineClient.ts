import {
  createEngineRequestResponseSchema,
  engineRequestResultSchema,
  engineRequestStatusSchema,
  proxyErrorSchema,
  type CreateEngineRequestInput,
} from "@/schemas/engine";

export type EngineErrorCategory =
  | "not_configured"
  | "network_error"
  | "timeout"
  | "engine_5xx"
  | "request_error"
  | "unknown";

type EngineClientErrorOptions = {
  code?: string;
  instructions?: string[];
  technicalStatus?: string;
  category?: EngineErrorCategory;
};

type EngineHealthResponse = {
  status: "online" | "degraded" | "unreachable";
  latency_ms?: number;
  detail?: string;
};

export class EngineClientError extends Error {
  statusCode: number;
  code?: string;
  technicalStatus?: string;
  instructions: string[];
  category: EngineErrorCategory;

  constructor(message: string, statusCode: number, options?: EngineClientErrorOptions) {
    super(message);
    this.name = "EngineClientError";
    this.statusCode = statusCode;
    this.code = options?.code;
    this.technicalStatus = options?.technicalStatus;
    this.instructions = options?.instructions ?? [];
    this.category = options?.category ?? "unknown";
  }
}

const REQUESTS_API = "/api/engine/requests";
const CLIENT_TIMEOUT_MS = 12_000;

function toCategory(code?: string, statusCode?: number): EngineErrorCategory {
  if (code === "ENGINE_NOT_CONFIGURED") {
    return "not_configured";
  }
  if (code === "ENGINE_UNREACHABLE") {
    return "network_error";
  }
  if (code === "ENGINE_TIMEOUT") {
    return "timeout";
  }
  if (code === "ENGINE_5XX" || (statusCode !== undefined && statusCode >= 500)) {
    return "engine_5xx";
  }
  if (statusCode !== undefined && statusCode >= 400) {
    return "request_error";
  }
  return "unknown";
}

async function parseResponseJson(response: Response) {
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

async function requestWithTimeout(input: RequestInfo, init?: RequestInit) {
  try {
    return await fetch(input, {
      ...init,
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    throw new EngineClientError(isTimeout ? "Engine timeout" : "Engine unreachable", 0, {
      category: isTimeout ? "timeout" : "network_error",
      technicalStatus: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
      code: isTimeout ? "CLIENT_TIMEOUT" : "CLIENT_NETWORK_ERROR",
    });
  }
}

async function ensureSuccess(response: Response) {
  if (response.ok) {
    return;
  }

  const parsed = await parseResponseJson(response);
  const errorPayload = proxyErrorSchema.safeParse(parsed);

  if (errorPayload.success) {
    throw new EngineClientError(errorPayload.data.error, response.status, {
      code: errorPayload.data.code,
      technicalStatus: errorPayload.data.technical_status,
      instructions: errorPayload.data.instructions,
      category: toCategory(errorPayload.data.code, response.status),
    });
  }

  throw new EngineClientError("Engine request failed", response.status, {
    category: toCategory(undefined, response.status),
  });
}

export async function submitEngineRequest(input: CreateEngineRequestInput) {
  const response = await requestWithTimeout(REQUESTS_API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  await ensureSuccess(response);
  return createEngineRequestResponseSchema.parse(await response.json());
}

export async function getEngineRequest(requestId: string) {
  const response = await requestWithTimeout(`${REQUESTS_API}/${requestId}`, {
    cache: "no-store",
  });

  await ensureSuccess(response);
  return engineRequestStatusSchema.parse(await response.json());
}

export async function getEngineResult(requestId: string) {
  const response = await requestWithTimeout(`${REQUESTS_API}/${requestId}/result`, {
    cache: "no-store",
  });

  await ensureSuccess(response);
  return engineRequestResultSchema.parse(await response.json());
}

export async function getEngineHealth() {
  const response = await requestWithTimeout("/api/engine/health", {
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      status: "unreachable",
      detail: "Engine unreachable",
    } satisfies EngineHealthResponse;
  }

  try {
    return (await response.json()) as EngineHealthResponse;
  } catch {
    return {
      status: "unreachable",
      detail: "Engine unreachable",
    } satisfies EngineHealthResponse;
  }
}

export function getEngineArtifactUrl(requestId: string, type: "json" | "csv" | "pdf") {
  return `${REQUESTS_API}/${requestId}/artifacts/${type}`;
}

export function resolveArtifactUrl(params: {
  requestId: string;
  type: "json" | "csv" | "pdf";
  artifacts?: Record<string, { signed_url?: string; endpoint?: string }>;
}) {
  const artifact = params.artifacts?.[params.type];

  if (artifact?.signed_url) {
    return artifact.signed_url;
  }

  if (artifact?.endpoint && /^https?:\/\//i.test(artifact.endpoint)) {
    return artifact.endpoint;
  }

  return getEngineArtifactUrl(params.requestId, params.type);
}

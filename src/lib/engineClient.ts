import {
  createEngineRequestResponseSchema,
  engineRequestResultSchema,
  engineRequestStatusSchema,
  proxyErrorSchema,
  type CreateEngineRequestInput,
} from "@/schemas/engine";

export class EngineClientError extends Error {
  statusCode: number;
  code?: string;
  offline: boolean;
  instructions: string[];

  constructor(
    message: string,
    statusCode: number,
    options?: { code?: string; instructions?: string[]; offline?: boolean },
  ) {
    super(message);
    this.name = "EngineClientError";
    this.statusCode = statusCode;
    this.code = options?.code;
    this.instructions = options?.instructions ?? [];
    this.offline = options?.offline ?? false;
  }
}

const REQUESTS_API = "/api/engine/requests";

async function parseResponse(response: Response) {
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

async function ensureSuccess(response: Response) {
  if (response.ok) {
    return;
  }

  const parsed = await parseResponse(response);
  const errorPayload = proxyErrorSchema.safeParse(parsed);

  if (errorPayload.success) {
    throw new EngineClientError(errorPayload.data.error, response.status, {
      code: errorPayload.data.code,
      instructions: errorPayload.data.instructions,
      offline: response.status === 503 || errorPayload.data.code === "ENGINE_OFFLINE",
    });
  }

  throw new EngineClientError("Failed to reach the policy engine.", response.status, {
    offline: response.status === 503,
  });
}

export async function submitEngineRequest(input: CreateEngineRequestInput) {
  const response = await fetch(REQUESTS_API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  await ensureSuccess(response);
  const parsed = createEngineRequestResponseSchema.parse(await response.json());
  return parsed;
}

export async function getEngineRequest(requestId: string) {
  const response = await fetch(`${REQUESTS_API}/${requestId}`, {
    cache: "no-store",
  });

  await ensureSuccess(response);
  return engineRequestStatusSchema.parse(await response.json());
}

export async function getEngineResult(requestId: string) {
  const response = await fetch(`${REQUESTS_API}/${requestId}/result`, {
    cache: "no-store",
  });

  await ensureSuccess(response);
  return engineRequestResultSchema.parse(await response.json());
}

export function getEngineArtifactUrl(requestId: string, type: "json" | "csv" | "pdf") {
  return `${REQUESTS_API}/${requestId}/artifacts/${type}`;
}

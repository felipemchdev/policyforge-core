import { NextResponse } from "next/server";

import {
  fetchEngine,
  getHealthStateFromLatency,
  responseForEngineFetchFailure,
} from "@/lib/server/engineProxy";

export async function GET() {
  const engineCall = await fetchEngine("/health");
  if (!engineCall.ok) {
    const response = responseForEngineFetchFailure(engineCall.failure);
    return NextResponse.json(
      {
        status: "unreachable",
        latency_ms: engineCall.durationMs,
        detail: "Engine unreachable",
      },
      { status: response.status },
    );
  }

  const { response, durationMs } = engineCall;
  if (!response.ok) {
    return NextResponse.json(
      {
        status: "unreachable",
        latency_ms: durationMs,
        detail: `Engine returned error (${response.status})`,
      },
      { status: response.status },
    );
  }

  return NextResponse.json({
    status: getHealthStateFromLatency(durationMs),
    latency_ms: durationMs,
  });
}

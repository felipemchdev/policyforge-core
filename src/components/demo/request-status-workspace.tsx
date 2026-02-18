"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EngineConfigBanner } from "@/components/demo/engine-config-banner";
import { ResultView } from "@/components/demo/result-view";
import { StatusPanel } from "@/components/demo/status-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EngineClientError, getEngineRequest, getEngineResult } from "@/lib/engineClient";
import type { EngineRequestResult } from "@/schemas/engine";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_DURATION_MS = 60_000;

function isCompleted(status: string) {
  return ["completed", "done", "succeeded"].includes(status.toLowerCase());
}

function isFailed(status: string) {
  return ["failed", "error", "rejected"].includes(status.toLowerCase());
}

function isActive(status: string) {
  return ["running", "pending", "queued", "processing", "submitted"].includes(status.toLowerCase());
}

function getStatusErrorMessage(error: EngineClientError) {
  if (error.category === "not_configured") {
    return "Engine not configured";
  }
  if (error.category === "network_error") {
    return "Engine unreachable";
  }
  if (error.category === "timeout") {
    return "Engine timeout";
  }
  if (error.category === "engine_5xx") {
    return "Engine returned error";
  }
  return error.message;
}

export function RequestStatusWorkspace({ requestId }: { requestId: string }) {
  const [status, setStatus] = useState("submitted");
  const [result, setResult] = useState<EngineRequestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [configInstructions, setConfigInstructions] = useState<string[] | undefined>(undefined);
  const [remainingSeconds, setRemainingSeconds] = useState(MAX_POLL_DURATION_MS / 1_000);
  const [slowWarning, setSlowWarning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const tick = async () => {
      const elapsed = Date.now() - startedAt;
      const nextRemaining = Math.max(0, Math.ceil((MAX_POLL_DURATION_MS - elapsed) / 1_000));
      setRemainingSeconds(nextRemaining);

      if (elapsed >= MAX_POLL_DURATION_MS) {
        setSlowWarning(true);
        return;
      }

      try {
        const nextStatus = await getEngineRequest(requestId);
        if (cancelled) {
          return;
        }

        setStatus(nextStatus.status);
        setErrorMessage(null);
        setConfigInstructions(undefined);

        if (isCompleted(nextStatus.status)) {
          const nextResult = await getEngineResult(requestId);
          if (!cancelled) {
            setResult(nextResult);
          }
          return;
        }

        if (isFailed(nextStatus.status)) {
          return;
        }

        if (isActive(nextStatus.status)) {
          timer = setTimeout(() => {
            void tick();
          }, POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof EngineClientError) {
          setErrorMessage(getStatusErrorMessage(error));
          if (error.category === "not_configured") {
            setConfigInstructions(error.instructions);
            return;
          }
        } else {
          setErrorMessage("Engine request failed");
        }

        timer = setTimeout(() => {
          void tick();
        }, POLL_INTERVAL_MS);
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [requestId]);

  const failed = useMemo(() => isFailed(status), [status]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">Processing request</h1>
        <p className="text-sm text-[#a1a1aa]">
          Request ID: <code className="text-[#d4d4d8]">{requestId}</code>
        </p>
      </header>

      {configInstructions ? <EngineConfigBanner instructions={configInstructions} /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-4">
          {result ? (
            <ResultView requestId={requestId} result={result} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Decision result</CardTitle>
                <CardDescription>Waiting for policy execution result.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[#a1a1aa]">
                Evaluation output will appear here as soon as the engine finishes.
              </CardContent>
            </Card>
          )}

          {failed ? (
            <Card className="border-[#7f1d1d]">
              <CardHeader>
                <CardTitle className="text-[#fca5a5]">Processing failed</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#fca5a5]">
                The engine reported a failure state for this request.
              </CardContent>
            </Card>
          ) : null}
        </section>

        <aside className="space-y-4">
          <StatusPanel status={status} />

          <Card>
            <CardHeader>
              <CardTitle>Polling monitor</CardTitle>
              <CardDescription>Automatic refresh every 2 seconds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#a1a1aa]">
              <p>Timeout in {remainingSeconds}s</p>
              {slowWarning ? (
                <p className="text-[#fde68a]">Processing is taking longer than usual</p>
              ) : null}
              {errorMessage ? <p className="text-[#fca5a5]">{errorMessage}</p> : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Refresh status
              </Button>
              <Button asChild variant="ghost">
                <Link href="/demo">New evaluation</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

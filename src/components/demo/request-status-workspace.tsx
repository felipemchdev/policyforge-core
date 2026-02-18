"use client";

import { useEffect, useMemo, useState } from "react";

import { EngineOfflineBanner } from "@/components/demo/engine-offline-banner";
import { ResultView } from "@/components/demo/result-view";
import { StatusPanel } from "@/components/demo/status-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EngineClientError, getEngineRequest, getEngineResult } from "@/lib/engineClient";
import type { EngineRequestResult } from "@/schemas/engine";

const POLL_INTERVAL_MS = 1_500;

function isCompleted(status: string) {
  return ["completed", "done", "succeeded"].includes(status.toLowerCase());
}

function isTerminal(status: string) {
  return [...["failed", "error", "rejected"], ...["completed", "done", "succeeded"]].includes(
    status.toLowerCase(),
  );
}

export function RequestStatusWorkspace({ requestId }: { requestId: string }) {
  const [status, setStatus] = useState("submitted");
  const [result, setResult] = useState<EngineRequestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [offlineInstructions, setOfflineInstructions] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const nextStatus = await getEngineRequest(requestId);
        if (cancelled) {
          return;
        }

        setStatus(nextStatus.status);
        setErrorMessage(null);
        setOfflineInstructions(undefined);

        if (isCompleted(nextStatus.status)) {
          const nextResult = await getEngineResult(requestId);
          if (!cancelled) {
            setResult(nextResult);
          }
          return;
        }

        if (!isTerminal(nextStatus.status)) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof EngineClientError) {
          setErrorMessage(error.message);
          if (error.offline) {
            setOfflineInstructions(error.instructions);
          }
        } else {
          setErrorMessage("Unable to refresh request status.");
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [requestId]);

  const failed = useMemo(
    () => ["failed", "error", "rejected"].includes(status.toLowerCase()),
    [status],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Evaluation status</h1>
        <p className="text-slate-700">
          Request ID: <code>{requestId}</code>
        </p>
      </header>

      {offlineInstructions ? <EngineOfflineBanner instructions={offlineInstructions} /> : null}

      <StatusPanel status={status} />

      {errorMessage ? (
        <Card className="border-rose-200">
          <CardHeader>
            <CardTitle className="text-rose-700">Status update error</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {failed ? (
        <Card className="border-rose-200">
          <CardHeader>
            <CardTitle className="text-rose-700">Evaluation ended with failure</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            Check the engine logs and retry with corrected data.
          </CardContent>
        </Card>
      ) : null}

      {result ? <ResultView requestId={requestId} result={result} /> : null}
    </div>
  );
}

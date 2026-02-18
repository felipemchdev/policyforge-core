import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TimelineStep = "Submitted" | "Running" | "Completed";

interface StatusPanelProps {
  status: string;
}

function getTimelineState(status: string, step: TimelineStep) {
  const normalized = status.toLowerCase();
  const runningStates = new Set(["pending", "queued", "running", "processing"]);
  const completedStates = new Set(["completed", "done", "succeeded"]);
  const failedStates = new Set(["failed", "error", "rejected"]);

  if (step === "Submitted") {
    return "done";
  }
  if (step === "Running") {
    if (completedStates.has(normalized) || failedStates.has(normalized)) {
      return "done";
    }
    if (runningStates.has(normalized)) {
      return "active";
    }
    return "idle";
  }
  if (completedStates.has(normalized)) {
    return "done";
  }
  if (failedStates.has(normalized)) {
    return "failed";
  }
  return "idle";
}

function getStatusVariant(status: string) {
  const normalized = status.toLowerCase();
  if (["pending", "queued", "submitted"].includes(normalized)) {
    return "secondary" as const;
  }
  if (["completed", "done", "succeeded"].includes(normalized)) {
    return "success" as const;
  }
  if (["failed", "error", "rejected"].includes(normalized)) {
    return "destructive" as const;
  }
  if (["running", "processing"].includes(normalized)) {
    return "info" as const;
  }
  return "secondary" as const;
}

export function StatusPanel({ status }: StatusPanelProps) {
  const steps: TimelineStep[] = ["Submitted", "Running", "Completed"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Request status</CardTitle>
        <Badge variant={getStatusVariant(status)}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {steps.map((step) => {
            const state = getTimelineState(status, step);
            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full bg-[#3f3f46]",
                    state === "active" && "bg-[#2563eb]",
                    state === "done" && "bg-[#16a34a]",
                    state === "failed" && "bg-[#dc2626]",
                  )}
                />
                <span className="text-sm text-[#d4d4d8]">{step}</span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

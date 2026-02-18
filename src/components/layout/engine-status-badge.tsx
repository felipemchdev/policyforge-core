"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { getEngineHealth } from "@/lib/engineClient";

type EngineHealthState = "checking" | "online" | "degraded" | "unreachable";

function getLabel(state: EngineHealthState) {
  if (state === "online") {
    return "Online";
  }
  if (state === "degraded") {
    return "Degraded";
  }
  if (state === "unreachable") {
    return "Unreachable";
  }
  return "Checking";
}

function getVariant(state: EngineHealthState) {
  if (state === "online") {
    return "success" as const;
  }
  if (state === "degraded") {
    return "warning" as const;
  }
  if (state === "unreachable") {
    return "destructive" as const;
  }
  return "secondary" as const;
}

export function EngineStatusBadge() {
  const [state, setState] = useState<EngineHealthState>("checking");

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      try {
        const health = await getEngineHealth();
        if (!mounted) {
          return;
        }
        setState(health.status);
      } catch {
        if (!mounted) {
          return;
        }
        setState("unreachable");
      }
    }

    void checkHealth();
    const interval = setInterval(() => {
      void checkHealth();
    }, 30_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Badge variant={getVariant(state)} className="text-[11px]">
      {getLabel(state)}
    </Badge>
  );
}

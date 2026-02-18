import Link from "next/link";

import { EngineStatusBadge } from "@/components/layout/engine-status-badge";
import { getEnvironment } from "@/lib/config";

function envLabel() {
  try {
    return getEnvironment().toUpperCase();
  } catch {
    return "UNSET";
  }
}

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold tracking-wide text-[#f5f5f5]">
            PolicyForge
          </Link>
          <nav className="flex items-center gap-4 text-xs text-[#a1a1aa]">
            <Link href="/demo" className="hover:text-[#f5f5f5]">
              Demo
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-[#1f1f1f] bg-[#111] px-2 py-1 text-[11px] text-[#a1a1aa]">
            {envLabel()}
          </span>
          <EngineStatusBadge />
        </div>
      </div>
    </header>
  );
}

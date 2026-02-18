import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10">
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
        <section className="space-y-6">
          <p className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            PolicyForge App Demo
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Recruiter workflow for policy-based education decisions.
          </h1>
          <p className="max-w-2xl text-base text-slate-700 md:text-lg">
            Choose a template, edit applicant fields, submit to the policy engine, and monitor
            status in near real-time.
          </p>
          <p className="max-w-2xl text-base text-slate-700 md:text-lg">
            Results include decision output, reasons, computed fields, and export artifacts in JSON,
            CSV, and PDF.
          </p>
          <Button asChild size="lg">
            <Link href="/demo">Try the Demo</Link>
          </Button>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Flow</CardTitle>
            <CardDescription>End-to-end demo path</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>1. Select template</p>
            <p>2. Edit form fields</p>
            <p>3. Run evaluation</p>
            <p>4. Track live status</p>
            <p>5. Inspect decision and reasons</p>
            <p>6. Download artifacts</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#71717a]">PolicyForge App</p>
          <h1 className="text-3xl font-semibold text-[#f5f5f5]">
            Policy execution for eligibility evaluation
          </h1>
          <p className="text-sm text-[#a1a1aa]">
            Recruiters can select templates, submit applications to the engine, monitor processing
            request status, and inspect decision results.
          </p>
          <p className="text-sm text-[#a1a1aa]">
            Output includes reasons, computed fields, and download options for JSON, CSV, and PDF.
          </p>
          <Button asChild>
            <Link href="/demo">Try the Demo</Link>
          </Button>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
            <CardDescription>Execution steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#a1a1aa]">
            <p>1. Choose template</p>
            <p>2. Fill input fields</p>
            <p>3. Run evaluation</p>
            <p>4. Follow status updates</p>
            <p>5. Review decision result</p>
            <p>6. Download artifacts</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

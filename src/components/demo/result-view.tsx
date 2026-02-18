import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEngineArtifactUrl } from "@/lib/engineClient";
import type { EngineRequestResult } from "@/schemas/engine";

interface ResultViewProps {
  requestId: string;
  result: EngineRequestResult;
}

function decisionVariant(decision: string) {
  const normalized = decision.toLowerCase();
  if (["approved", "accept", "accepted"].includes(normalized)) {
    return "success" as const;
  }
  if (["rejected", "deny", "denied"].includes(normalized)) {
    return "destructive" as const;
  }
  return "warning" as const;
}

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

export function ResultView({ requestId, result }: ResultViewProps) {
  const computedRows = Object.entries(result.computed_fields);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Decision</CardTitle>
            <CardDescription>Final output from policy evaluation.</CardDescription>
          </div>
          <Badge variant={decisionVariant(result.decision)}>{result.decision}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Reasons</h3>
            {result.reasons.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No reasons were returned by the engine.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Computed fields</CardTitle>
          <CardDescription>Derived values returned with the decision.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {computedRows.length > 0 ? (
                computedRows.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{toText(value)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="font-medium">-</TableCell>
                  <TableCell>No computed fields</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <a href={getEngineArtifactUrl(requestId, "json")} target="_blank" rel="noreferrer">
                Download JSON
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={getEngineArtifactUrl(requestId, "csv")} target="_blank" rel="noreferrer">
                Download CSV
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={getEngineArtifactUrl(requestId, "pdf")} target="_blank" rel="noreferrer">
                Download PDF
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

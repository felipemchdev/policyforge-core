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
import { resolveArtifactUrl } from "@/lib/engineClient";
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
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Decision result</CardTitle>
            <CardDescription>Final output from policy execution.</CardDescription>
          </div>
          <Badge variant={decisionVariant(result.decision)}>{result.decision}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#d4d4d8]">Reasons</h3>
            {result.reasons.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-[#a1a1aa]">
                {result.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#a1a1aa]">No reasons were returned by the engine.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Computed fields</CardTitle>
          <CardDescription>Derived values returned with the decision result.</CardDescription>
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
                    <TableCell className="font-medium text-[#d4d4d8]">{key}</TableCell>
                    <TableCell className="text-[#a1a1aa]">{toText(value)}</TableCell>
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
              <a
                href={resolveArtifactUrl({
                  requestId,
                  type: "json",
                  artifacts: result.artifacts,
                })}
                target="_blank"
                rel="noreferrer"
              >
                Download JSON
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a
                href={resolveArtifactUrl({
                  requestId,
                  type: "csv",
                  artifacts: result.artifacts,
                })}
                target="_blank"
                rel="noreferrer"
              >
                Download CSV
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a
                href={resolveArtifactUrl({
                  requestId,
                  type: "pdf",
                  artifacts: result.artifacts,
                })}
                target="_blank"
                rel="noreferrer"
              >
                Download PDF
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

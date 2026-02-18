import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function EngineOfflineBanner({ instructions }: { instructions?: string[] }) {
  return (
    <Alert>
      <AlertTitle>Engine offline</AlertTitle>
      <AlertDescription>
        <p>The evaluation engine is unavailable at the moment.</p>
        <p className="mt-1">
          Configure <code>ENGINE_URL</code> in <code>.env.local</code> and in Vercel environment
          variables.
        </p>
        {instructions && instructions.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

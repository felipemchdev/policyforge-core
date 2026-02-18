import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function EngineConfigBanner({ instructions }: { instructions?: string[] }) {
  return (
    <Alert>
      <AlertTitle>Engine not configured</AlertTitle>
      <AlertDescription>
        <p>Set `NEXT_PUBLIC_ENGINE_URL` and `NEXT_PUBLIC_ENVIRONMENT` in your environment.</p>
        {instructions && instructions.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

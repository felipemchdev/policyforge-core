const ENVIRONMENTS = ["dev", "qa", "prod"] as const;

export type Environment = (typeof ENVIRONMENTS)[number];

function removeTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getEnvironment(input = process.env.NEXT_PUBLIC_ENVIRONMENT): Environment {
  const value = input?.trim().toLowerCase();

  if (!value) {
    throw new Error("NEXT_PUBLIC_ENVIRONMENT is not configured.");
  }

  if (!ENVIRONMENTS.includes(value as Environment)) {
    throw new Error("NEXT_PUBLIC_ENVIRONMENT must be one of: dev, qa, prod.");
  }

  return value as Environment;
}

export function getEngineBaseUrl(input = process.env.NEXT_PUBLIC_ENGINE_URL): string {
  const rawValue = input?.trim();

  if (!rawValue) {
    throw new Error("Engine not configured: set NEXT_PUBLIC_ENGINE_URL.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error("NEXT_PUBLIC_ENGINE_URL is invalid. Use a full URL (https://...).");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("NEXT_PUBLIC_ENGINE_URL must use http or https.");
  }

  return removeTrailingSlash(rawValue);
}

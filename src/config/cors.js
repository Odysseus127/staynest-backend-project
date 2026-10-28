const DEFAULT_CORS_ORIGINS = ["http://localhost:5173"];

export function parseCorsOrigins(value) {
  if (!value?.trim()) return DEFAULT_CORS_ORIGINS;

  const origins = value.split(",").map((origin) => origin.trim());
  if (origins.some((origin) => !origin)) {
    throw new Error("CORS_ORIGINS must be a comma-separated list of origins");
  }

  for (const origin of origins) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`Invalid origin in CORS_ORIGINS: ${origin}`);
    }

    if (
      !["http:", "https:"].includes(parsed.protocol)
      || parsed.origin !== origin
      || origin === "null"
    ) {
      throw new Error(`Invalid origin in CORS_ORIGINS: ${origin}`);
    }
  }

  return [...new Set(origins)];
}

export function getCorsOrigins() {
  return parseCorsOrigins(process.env.CORS_ORIGINS);
}

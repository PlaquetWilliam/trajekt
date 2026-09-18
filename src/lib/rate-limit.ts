import "server-only";
import { headers } from "next/headers";

// Limiteur en mémoire : suffisant pour une seule instance (Render gratuit).
const buckets = new Map<string, number[]>();

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** Renvoie true si la limite est dépassée pour cette clé. */
export function isRateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 10_000) buckets.clear();
  return recent.length > max;
}

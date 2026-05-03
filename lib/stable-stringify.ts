// Recursive deterministic JSON serialiser: same logical value always produces
// the same string regardless of object-key insertion order. JSON.stringify's
// replacer-array argument only filters top-level keys and does not recurse —
// using it as a "sort hint" silently breaks cache parity for object inputs
// (the bug previously latent in lib/kv-cache.ts:makeCacheKey).
//
// Pure function, no I/O, no `server-only` guard — safely importable from
// vitest, server modules, and (in principle) the client. Live next to the
// kv-cache wrapper because that's the only current caller.

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

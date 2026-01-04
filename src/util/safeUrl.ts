export function safeUrl(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  try {
    const url = new URL(raw, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

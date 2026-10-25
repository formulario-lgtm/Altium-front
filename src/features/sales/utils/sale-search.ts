/** Map free-text search to the backend list filters (AND semantics). */
export function saleListSearchParams(raw: string): {
  saleNumber?: string;
  holderName?: string;
} {
  const q = raw.trim();
  if (!q) return {};
  if (/^v[-\s]?\d/i.test(q) || /^\d+$/.test(q)) return { saleNumber: q };
  return { holderName: q };
}

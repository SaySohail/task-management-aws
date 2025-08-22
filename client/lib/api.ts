// client/lib/api.ts
const RAW = process.env.NEXT_PUBLIC_BASE_URL;

function normalizeBase(v?: string) {
  // reject missing, empty, or the strings "undefined"/"null"
  if (!v || v === "undefined" || v === "null" || v.trim() === "") return "";
  return v.replace(/\/+$/, ""); // strip trailing slash(es)
}

export const API_BASE = normalizeBase(RAW);

export const apiUrl = (p: string) =>
  `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;

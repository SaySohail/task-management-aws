// client/lib/api.ts
const RAW = process.env.NEXT_PUBLIC_BASE_URL;
export const API_BASE = RAW ? RAW.replace(/\/+$/, "") : "";
export const apiUrl = (p: string) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;

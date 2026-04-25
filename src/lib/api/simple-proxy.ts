import { corsHeaders, errorResponse, requireApiKey } from "./helpers";

/**
 * Build a fetch-and-return-as-result handler for routes that proxy a free public API.
 * Use inside a `createFileRoute(...)({ server: { handlers: { GET: simpleProxy(...) } } })`.
 */
export function simpleProxy(
  fetcher: (request: Request) => Promise<unknown>,
) {
  return async ({ request }: { request: Request }) => {
    const auth = requireApiKey(request);
    if (auth) return auth;
    try {
      const result = await fetcher(request);
      return new Response(
        JSON.stringify({ success: true, creator: "Popkid API", result }, null, 2),
        { headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : "Upstream failed", 502);
    }
  };
}

export async function fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { Accept: "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json() as Promise<T>;
}

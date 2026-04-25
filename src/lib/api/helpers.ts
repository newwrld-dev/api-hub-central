// Shared helpers for /api/* server routes.
// These run on the edge (Cloudflare Worker) so they:
//   - Have no Node-only deps
//   - Use Web fetch + standard Response
//   - Validate apikey on every request
//
// Free public API key for everyone:
export const PUBLIC_API_KEYS = new Set(["popkid", "free", "test"]);

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
  "Access-Control-Max-Age": "86400",
};

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });
}

export function errorResponse(message: string, status = 400, extra: Record<string, unknown> = {}): Response {
  return jsonResponse(
    {
      success: false,
      status,
      message,
      ...extra,
      creator: "Popkid API",
    },
    { status },
  );
}

export function successResponse(result: unknown, extra: Record<string, unknown> = {}): Response {
  return jsonResponse({
    success: true,
    status: 200,
    creator: "Popkid API",
    result,
    ...extra,
  });
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/** Read apikey from query (?apikey=) or header (x-api-key / Authorization: Bearer ...). */
export function getApiKey(request: Request): string | null {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("apikey") ?? url.searchParams.get("api_key");
  if (fromQuery) return fromQuery;
  const header = request.headers.get("x-api-key");
  if (header) return header;
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

/** Validate apikey. Returns null on success, an error Response otherwise. */
export function requireApiKey(request: Request): Response | null {
  const key = getApiKey(request);
  if (!key) {
    return errorResponse(
      "Missing apikey. Add ?apikey=popkid to your request URL.",
      401,
      { hint: "Free key: popkid" },
    );
  }
  if (!PUBLIC_API_KEYS.has(key)) {
    return errorResponse(
      "Invalid apikey. Use the free key 'popkid' or contact us for a personal key.",
      403,
    );
  }
  return null;
}

/** Get a typed query param. */
export function q(request: Request, name: string): string | null {
  return new URL(request.url).searchParams.get(name);
}

export function requireParam(request: Request, name: string): string | Response {
  const v = q(request, name);
  if (!v) return errorResponse(`Missing required query parameter: ${name}`, 400);
  return v;
}

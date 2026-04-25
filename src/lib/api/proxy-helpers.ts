import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders, errorResponse, handleOptions, requireApiKey } from "@/lib/api/helpers";

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json();
}

function makeProxyRoute(path: `/api/${string}`, upstream: () => Promise<unknown>, transform?: (d: unknown) => unknown) {
  return createFileRoute(path)({
    server: {
      handlers: {
        OPTIONS: async () => handleOptions(),
        GET: async ({ request }) => {
          const auth = requireApiKey(request);
          if (auth) return auth;
          try {
            const data = await upstream();
            const result = transform ? transform(data) : data;
            return new Response(
              JSON.stringify({ success: true, creator: "Popkid API", result }, null, 2),
              { headers: { "Content-Type": "application/json", ...corsHeaders } },
            );
          } catch (e) {
            return errorResponse(e instanceof Error ? e.message : "Failed", 500);
          }
        },
      },
    },
  });
}

export { fetchJson, makeProxyRoute };

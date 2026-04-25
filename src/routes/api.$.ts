import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey } from "@/lib/api/helpers";

/**
 * Catch-all route for /api/anything-else — returns a friendly "coming soon" JSON
 * so users see a structured response instead of a 404.
 */
export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request, params }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const path = `/api/${params._splat}`;
        return new Response(JSON.stringify({
          success: false,
          status: 404,
          creator: "Popkid API",
          message: `Endpoint '${path}' is not yet implemented.`,
          hint: "Browse /endpoints to see all live endpoints. New ones ship every week.",
          documented_endpoints: "/docs",
        }, null, 2), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

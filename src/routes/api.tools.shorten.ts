import { createFileRoute } from "@tanstack/react-router";
import {
  corsHeaders, errorResponse, handleOptions, requireApiKey, requireParam,
} from "@/lib/api/helpers";

export const Route = createFileRoute("/api/tools/shorten")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const longUrl = requireParam(request, "url");
        if (longUrl instanceof Response) return longUrl;

        try {
          new URL(longUrl);
        } catch {
          return errorResponse("Invalid URL provided", 400);
        }

        try {
          // is.gd is a free, no-key URL shortener
          const res = await fetch(
            `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`,
          );
          const text = (await res.text()).trim();
          if (!res.ok || !text.startsWith("http")) {
            return errorResponse(`Shortener error: ${text.slice(0, 200)}`, 500);
          }
          return new Response(
            JSON.stringify({
              success: true,
              creator: "Popkid API",
              original: longUrl,
              result: { short: text },
            }, null, 2),
            { headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "Network error", 500);
        }
      },
    },
  },
});

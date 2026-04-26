import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey, errorResponse, corsHeaders } from "@/lib/api/helpers";

interface ScorebatMatch {
  title: string;
  competition: string;
  date?: string;
  matchviewUrl?: string;
  thumbnail?: string;
}

export const Route = createFileRoute("/api/sports/livescores")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        try {
          const r = await fetch("https://www.scorebat.com/video-api/v3/", {
            headers: { "User-Agent": "Popkid-API/1.0" },
          });
          if (!r.ok) return errorResponse(`Upstream ${r.status}`, 502);
          const d = await r.json() as { response?: ScorebatMatch[] };
          const matches = (d.response ?? []).slice(0, 30).map(m => ({
            title: m.title,
            competition: m.competition,
            date: m.date,
            url: m.matchviewUrl,
            thumbnail: m.thumbnail,
          }));
          return new Response(
            JSON.stringify({
              success: true, status: 200, creator: "Popkid API",
              result: matches, count: matches.length,
            }, null, 2),
            { headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "Live scores failed", 502);
        }
      },
    },
  },
});

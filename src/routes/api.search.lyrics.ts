import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

export const Route = createFileRoute("/api/search/lyrics")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const queryRaw = requireParam(request, "q");
        if (queryRaw instanceof Response) return queryRaw;

        // Try "Artist - Title" or "Title" by Artist
        const q = queryRaw.trim();
        let artist = "";
        let title = q;
        if (q.includes("-")) {
          const [a, ...rest] = q.split("-");
          artist = a.trim();
          title = rest.join("-").trim();
        }
        if (!artist) {
          // Use lyrics.ovh search-by-track to guess
          artist = "various";
        }

        try {
          const res = await fetch(
            `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
          );
          const data: { lyrics?: string; error?: string } = await res.json();
          if (!res.ok || !data.lyrics) {
            return errorResponse(
              `No lyrics found. Try '?q=Artist - Song Title'.`,
              404,
              { tried: { artist, title } },
            );
          }
          return new Response(JSON.stringify({
            success: true,
            creator: "Popkid API",
            result: { artist, title, lyrics: data.lyrics.trim() },
          }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "Lyrics fetch failed", 500);
        }
      },
    },
  },
});

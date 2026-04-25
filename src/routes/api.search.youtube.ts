import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

interface YtSearchItem { title: string; videoId: string; author?: { name: string }; lengthSeconds?: number; viewCount?: number; thumbnail?: { thumbnails?: { url: string }[] } }

export const Route = createFileRoute("/api/search/youtube")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const query = requireParam(request, "q");
        if (query instanceof Response) return query;

        // Use the public, no-key Piped instances (open-source YT frontend)
        const instances = ["https://pipedapi.kavin.rocks", "https://pipedapi.adminforge.de"];
        for (const base of instances) {
          try {
            const res = await fetch(`${base}/search?q=${encodeURIComponent(query)}&filter=videos`);
            if (!res.ok) continue;
            const data = await res.json();
            const items = (data.items ?? []).slice(0, 10).map((it: { url?: string; title?: string; uploaderName?: string; duration?: number; views?: number; thumbnail?: string }) => ({
              title: it.title,
              channel: it.uploaderName,
              duration: it.duration,
              views: it.views,
              thumbnail: it.thumbnail,
              url: it.url ? `https://www.youtube.com${it.url}` : undefined,
            }));
            return new Response(JSON.stringify({
              success: true, creator: "Popkid API", query, result: items,
            }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
          } catch {
            continue;
          }
        }
        return errorResponse("All YouTube search instances failed. Try again later.", 502);
      },
    },
  },
});

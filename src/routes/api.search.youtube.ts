import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Popkid/1.0";

interface YtItem {
  title: string;
  url: string;
  videoId: string;
  thumbnail: string;
  channel?: string;
  duration?: string;
  views?: string;
  published?: string;
}

/** Scrape YouTube search results page (no API key). */
async function scrapeYoutubeSearch(query: string): Promise<YtItem[]> {
  const html = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
  }).then((r) => r.text());

  // Extract ytInitialData JSON
  const m = /var ytInitialData = (\{.*?\});<\/script>/s.exec(html);
  if (!m) return [];
  let data: unknown;
  try { data = JSON.parse(m[1]); } catch { return []; }

  const results: YtItem[] = [];
  // Walk the structure to find videoRenderer entries
  const walk = (node: unknown) => {
    if (!node || results.length >= 15) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (obj.videoRenderer) {
      const v = obj.videoRenderer as Record<string, unknown>;
      const videoId = v.videoId as string | undefined;
      if (videoId) {
        const title = ((v.title as { runs?: { text?: string }[] })?.runs?.[0]?.text) ?? "";
        const thumbs = (v.thumbnail as { thumbnails?: { url: string }[] })?.thumbnails ?? [];
        const channel = ((v.ownerText as { runs?: { text?: string }[] })?.runs?.[0]?.text) ?? "";
        const duration = (v.lengthText as { simpleText?: string })?.simpleText;
        const views = (v.viewCountText as { simpleText?: string })?.simpleText;
        const published = (v.publishedTimeText as { simpleText?: string })?.simpleText;
        results.push({
          title,
          videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: thumbs[thumbs.length - 1]?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          channel,
          duration,
          views,
          published,
        });
      }
    }
    for (const v of Object.values(obj)) walk(v);
  };
  walk(data);
  return results;
}

export const Route = createFileRoute("/api/search/youtube")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const query = requireParam(request, "q");
        if (query instanceof Response) return query;

        try {
          const items = await scrapeYoutubeSearch(query);
          if (items.length === 0) {
            return errorResponse("No results found.", 404, { query });
          }
          return new Response(
            JSON.stringify({ success: true, status: 200, creator: "Popkid API", query, result: items }, null, 2),
            { headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "YouTube search failed", 502);
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

interface WikiSummary {
  title: string;
  extract: string;
  description?: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source: string };
}

interface DDGResp {
  AbstractText?: string;
  AbstractURL?: string;
  Heading?: string;
  Image?: string;
  RelatedTopics?: { Text?: string; FirstURL?: string; Icon?: { URL?: string } }[];
}

const WIKI_HEADERS = {
  "User-Agent": "Popkid-API/1.0 (https://sweet-download-zone.lovable.app; contact@popkid.api)",
  Accept: "application/json",
};

export const Route = createFileRoute("/api/search/google")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const query = requireParam(request, "q");
        if (query instanceof Response) return query;

        const related: { title: string; link?: string; thumbnail?: string }[] = [];
        let summary: WikiSummary | null = null;

        // Wikipedia summary
        try {
          const wRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, "_"))}`,
            { headers: WIKI_HEADERS },
          );
          if (wRes.ok) summary = await wRes.json() as WikiSummary;
        } catch { /* ignore */ }

        // DuckDuckGo Instant Answer for related links
        try {
          const ddg = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1`,
            { headers: { "User-Agent": "Popkid-API/1.0" } },
          );
          if (ddg.ok) {
            const j = await ddg.json() as DDGResp;
            if (!summary && j.AbstractText) {
              summary = {
                title: j.Heading ?? query,
                extract: j.AbstractText,
                content_urls: { desktop: { page: j.AbstractURL } },
                thumbnail: j.Image ? { source: `https://duckduckgo.com${j.Image}` } : undefined,
              };
            }
            for (const t of j.RelatedTopics ?? []) {
              if (t.Text && t.FirstURL && related.length < 8) {
                related.push({
                  title: t.Text,
                  link: t.FirstURL,
                  thumbnail: t.Icon?.URL ? `https://duckduckgo.com${t.Icon.URL}` : undefined,
                });
              }
            }
          }
        } catch { /* ignore */ }

        if (!summary && related.length === 0) {
          return errorResponse("No results found.", 404, { query });
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: 200,
            creator: "Popkid API",
            query,
            result: {
              title: summary?.title,
              description: summary?.description,
              summary: summary?.extract,
              link: summary?.content_urls?.desktop?.page,
              thumbnail: summary?.thumbnail?.source,
              related,
            },
          }, null, 2),
          { headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      },
    },
  },
});

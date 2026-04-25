import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

interface WikiSummary { title: string; extract: string; description?: string; content_urls?: { desktop?: { page?: string } }; thumbnail?: { source: string } }

export const Route = createFileRoute("/api/search/google")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const query = requireParam(request, "q");
        if (query instanceof Response) return query;
        // We use Wikipedia summary as a free, no-key knowledge endpoint.
        // (True Google search is not free / without API keys.)
        try {
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
          );
          if (res.status === 404) return errorResponse("No results found", 404);
          if (!res.ok) return errorResponse(`Search error: ${res.status}`, 502);
          const d: WikiSummary = await res.json();
          return new Response(JSON.stringify({
            success: true,
            creator: "Popkid API",
            note: "Backed by Wikipedia (free, no key). For Google-grade results, use a paid plan.",
            result: {
              title: d.title,
              description: d.description,
              summary: d.extract,
              link: d.content_urls?.desktop?.page,
              thumbnail: d.thumbnail?.source,
            },
          }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "Search failed", 500);
        }
      },
    },
  },
});

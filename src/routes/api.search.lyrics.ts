import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

interface ITunesResult {
  resultCount: number;
  results: { artistName: string; trackName: string; artworkUrl100?: string; previewUrl?: string; collectionName?: string }[];
}

async function fetchLyrics(artist: string, title: string): Promise<string | null> {
  const r = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
  );
  if (!r.ok) return null;
  const d = await r.json() as { lyrics?: string };
  return d.lyrics?.trim() || null;
}

export const Route = createFileRoute("/api/search/lyrics")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const queryRaw = requireParam(request, "q");
        if (queryRaw instanceof Response) return queryRaw;

        const q = queryRaw.trim();
        let artist = "";
        let title = q;

        // 1. Try "Artist - Title" split
        if (q.includes("-")) {
          const idx = q.indexOf("-");
          artist = q.slice(0, idx).trim();
          title = q.slice(idx + 1).trim();
        }

        // 2. If user gave just one phrase, search iTunes for best match
        if (!artist) {
          try {
            const it = await fetch(
              `https://itunes.apple.com/search?media=music&entity=song&limit=1&term=${encodeURIComponent(q)}`,
            );
            if (it.ok) {
              const data = await it.json() as ITunesResult;
              const top = data.results[0];
              if (top) {
                artist = top.artistName;
                title = top.trackName;
              }
            }
          } catch { /* ignore */ }
        }

        if (!artist) {
          return errorResponse(
            "Could not identify artist. Try '?q=Artist - Song Title'.",
            400,
            { query: q },
          );
        }

        try {
          let lyrics = await fetchLyrics(artist, title);
          // Try lowercase / strip punctuation as backup
          if (!lyrics) {
            lyrics = await fetchLyrics(artist, title.replace(/[(\[].*?[)\]]/g, "").trim());
          }
          if (!lyrics) {
            return errorResponse(
              "Lyrics not found for the resolved track.",
              404,
              { resolved: { artist, title } },
            );
          }
          // Get artwork from iTunes
          let artwork: string | undefined;
          try {
            const it = await fetch(
              `https://itunes.apple.com/search?media=music&entity=song&limit=1&term=${encodeURIComponent(`${artist} ${title}`)}`,
            );
            if (it.ok) {
              const j = await it.json() as ITunesResult;
              artwork = j.results[0]?.artworkUrl100?.replace("100x100", "600x600");
            }
          } catch { /* ignore */ }

          return new Response(
            JSON.stringify({
              success: true, status: 200, creator: "Popkid API",
              result: { artist, title, artwork, lyrics },
            }, null, 2),
            { headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "Lyrics fetch failed", 502);
        }
      },
    },
  },
});

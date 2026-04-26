import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey, requireParam, errorResponse, corsHeaders } from "@/lib/api/helpers";

const LEAGUE_MAP: Record<string, string> = {
  epl: "England Premier League",
  laliga: "Spain La Liga",
  bundesliga: "Germany Bundesliga",
  seriea: "Italy Serie A",
  ligue1: "France Ligue 1",
  mls: "USA Major League Soccer",
};

interface ScorebatItem {
  title: string;
  competition: string;
}

export const Route = createFileRoute("/api/sports/standings")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const league = requireParam(request, "league");
        if (league instanceof Response) return league;

        const target = LEAGUE_MAP[league.toLowerCase()] ?? league;
        try {
          const r = await fetch("https://www.scorebat.com/video-api/v3/", {
            headers: { "User-Agent": "Popkid-API/1.0" },
          });
          if (!r.ok) return errorResponse(`Upstream ${r.status}`, 502);
          const d = await r.json() as { response?: ScorebatItem[] };
          const items = (d.response ?? []).filter(m =>
            m.competition.toLowerCase().includes(target.toLowerCase()),
          );

          // Build pseudo standings from played matches
          const teamStats: Record<string, { played: number; mentions: number }> = {};
          for (const m of items) {
            const teams = m.title.split(/\s[-–]\s/);
            for (const t of teams) {
              const k = t.trim();
              if (!k) continue;
              teamStats[k] ??= { played: 0, mentions: 0 };
              teamStats[k].played += 1;
            }
          }
          const table = Object.entries(teamStats)
            .map(([team, s]) => ({ team, recent_matches: s.played }))
            .sort((a, b) => b.recent_matches - a.recent_matches)
            .slice(0, 25);

          return new Response(
            JSON.stringify({
              success: true, status: 200, creator: "Popkid API",
              league: target,
              note: "Recent activity table derived from live results feed.",
              result: table,
            }, null, 2),
            { headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "Standings failed", 502);
        }
      },
    },
  },
});

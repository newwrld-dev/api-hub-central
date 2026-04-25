import { createFileRoute } from "@tanstack/react-router";
import { handleOptions } from "@/lib/api/helpers";
import { fetchJson, simpleProxy } from "@/lib/api/simple-proxy";

interface AnimeQuote { quote: string; character: string; anime: string }

export const Route = createFileRoute("/api/anime/quote")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: simpleProxy(async () => {
        try {
          const d = await fetchJson<AnimeQuote>("https://animechan.io/api/v1/quotes/random");
          return d;
        } catch {
          // Fallback to local pool if upstream is down
          const pool: AnimeQuote[] = [
            { quote: "Hard work is worthless for those that don't believe in themselves.", character: "Naruto Uzumaki", anime: "Naruto" },
            { quote: "People die when they are killed.", character: "Shirou Emiya", anime: "Fate/stay night" },
            { quote: "It's not the face that makes someone a monster, it's the choices they make with their lives.", character: "Naruto Uzumaki", anime: "Naruto" },
            { quote: "Power comes in response to a need, not a desire.", character: "Goku", anime: "Dragon Ball Z" },
          ];
          return pool[Math.floor(Math.random() * pool.length)];
        }
      }),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { handleOptions } from "@/lib/api/helpers";
import { fetchJson, simpleProxy } from "@/lib/api/simple-proxy";

export const Route = createFileRoute("/api/anime/waifu")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: simpleProxy(async () => {
        const data = await fetchJson<{ url: string }>("https://api.waifu.pics/sfw/waifu");
        return { image: data.url };
      }),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { handleOptions } from "@/lib/api/helpers";
import { fetchJson, simpleProxy } from "@/lib/api/simple-proxy";

export const Route = createFileRoute("/api/fun/meme")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: simpleProxy(async () => {
        const data = await fetchJson<{ title: string; url: string; postLink: string; subreddit: string; author: string }>(
          "https://meme-api.com/gimme",
        );
        return {
          title: data.title,
          image: data.url,
          source: data.postLink,
          subreddit: data.subreddit,
          author: data.author,
        };
      }),
    },
  },
});

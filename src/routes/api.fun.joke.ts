import { createFileRoute } from "@tanstack/react-router";
import { handleOptions } from "@/lib/api/helpers";
import { fetchJson, simpleProxy } from "@/lib/api/simple-proxy";

export const Route = createFileRoute("/api/fun/joke")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: simpleProxy(async () => {
        const data = await fetchJson<{ setup: string; punchline: string; type: string }>(
          "https://official-joke-api.appspot.com/random_joke",
        );
        return { setup: data.setup, punchline: data.punchline, type: data.type };
      }),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { handleOptions } from "@/lib/api/helpers";
import { downloaderHandler } from "@/lib/api/cobalt";

export const Route = createFileRoute("/api/download/twitter")({
  server: { handlers: { OPTIONS: async () => handleOptions(), GET: downloaderHandler() } },
});

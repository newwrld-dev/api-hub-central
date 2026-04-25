import { createFileRoute } from "@tanstack/react-router";
import { buildHandler, handleOptionsRoute } from "@/lib/api/ai-handler";

export const Route = createFileRoute("/api/ai/claude")({
  server: {
    handlers: {
      OPTIONS: handleOptionsRoute,
      GET: buildHandler(
        "openai/gpt-5",
        "You are a thoughtful, articulate AI assistant in the style of Claude. Be helpful, harmless, and honest.",
      ),
    },
  },
});

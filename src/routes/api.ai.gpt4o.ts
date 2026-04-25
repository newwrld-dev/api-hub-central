import { createFileRoute } from "@tanstack/react-router";
import { buildHandler, handleOptionsRoute } from "@/lib/api/ai-handler";

export const Route = createFileRoute("/api/ai/gpt4o")({
  server: {
    handlers: {
      OPTIONS: handleOptionsRoute,
      GET: buildHandler(
        "openai/gpt-5-mini",
        "You are GPT, a powerful AI assistant. Answer accurately and concisely.",
      ),
    },
  },
});

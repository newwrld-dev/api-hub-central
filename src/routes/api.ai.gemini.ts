import { createFileRoute } from "@tanstack/react-router";
import { buildHandler, handleOptionsRoute } from "@/lib/api/ai-handler";

export const Route = createFileRoute("/api/ai/gemini")({
  server: {
    handlers: {
      OPTIONS: handleOptionsRoute,
      GET: buildHandler(
        "google/gemini-2.5-pro",
        "You are Gemini, an advanced multimodal AI. Be helpful, structured, and clear.",
      ),
    },
  },
});

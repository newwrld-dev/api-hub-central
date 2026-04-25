import { createFileRoute } from "@tanstack/react-router";
import {
  corsHeaders, errorResponse, handleOptions, requireApiKey, requireParam, successResponse,
} from "@/lib/api/helpers";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function chat(prompt: string, system?: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured on the server");

  const messages: { role: string; content: string }[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages, stream: false }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit reached. Please slow down.");
    if (res.status === 402) throw new Error("AI quota exhausted on this server. Try again later.");
    const t = await res.text();
    throw new Error(`AI gateway error (${res.status}): ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI returned an empty response");
  return content;
}

export const Route = createFileRoute("/api/ai/ai")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const prompt = requireParam(request, "q");
        if (prompt instanceof Response) return prompt;
        try {
          const result = await chat(
            prompt,
            "You are Popkid AI, a helpful, friendly multi-purpose assistant. Keep replies clear and concise.",
          );
          return successResponse(result, { model: MODEL });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          return errorResponse(msg, 500);
        }
      },
      POST: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        let body: { q?: string; system?: string };
        try {
          body = await request.json();
        } catch {
          return errorResponse("Invalid JSON body", 400);
        }
        if (!body.q) return errorResponse("Missing 'q' in JSON body", 400);
        try {
          const result = await chat(body.q, body.system);
          return new Response(JSON.stringify({ success: true, result, model: MODEL }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          return errorResponse(msg, 500);
        }
      },
    },
  },
});

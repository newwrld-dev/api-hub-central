import { createFileRoute } from "@tanstack/react-router";
import {
  corsHeaders, errorResponse, handleOptions, requireApiKey, requireParam,
} from "@/lib/api/helpers";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const Route = createFileRoute("/api/ai/imagine")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const prompt = requireParam(request, "prompt");
        if (prompt instanceof Response) return prompt;

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return errorResponse("Server misconfigured", 500);

        try {
          const res = await fetch(GATEWAY, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{ role: "user", content: prompt }],
              modalities: ["image", "text"],
            }),
          });
          if (!res.ok) {
            const t = await res.text();
            return errorResponse(`Image generation failed (${res.status}): ${t.slice(0, 200)}`, 500);
          }
          const data = await res.json();
          const imageUrl: string | undefined =
            data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (!imageUrl) return errorResponse("No image returned by AI", 500);

          // Return JSON with the data URL
          return new Response(
            JSON.stringify({
              success: true,
              creator: "Popkid API",
              prompt,
              result: { url: imageUrl },
            }, null, 2),
            {
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            },
          );
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "Unknown error", 500);
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import {
  corsHeaders, errorResponse, handleOptions, requireApiKey, requireParam, successResponse,
} from "@/lib/api/helpers";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

function buildHandler(model: string, system: string) {
  return async ({ request }: { request: Request }) => {
    const auth = requireApiKey(request);
    if (auth) return auth;
    const prompt = requireParam(request, "q");
    if (prompt instanceof Response) return prompt;

    const key = process.env.LOVABLE_API_KEY;
    if (!key) return errorResponse("Server misconfigured: LOVABLE_API_KEY missing", 500);

    try {
      const res = await fetch(GATEWAY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          stream: false,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        return errorResponse(`AI error (${res.status}): ${t.slice(0, 200)}`, res.status === 429 ? 429 : 500);
      }
      const data = await res.json();
      const result = data?.choices?.[0]?.message?.content ?? "";
      return successResponse(result, { model });
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : "Unknown error", 500);
    }
  };
}

export const handleOptionsRoute = async () => handleOptions();
export const corsHeadersExport = corsHeaders;
export { buildHandler };

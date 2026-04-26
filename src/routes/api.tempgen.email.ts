import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey, errorResponse, corsHeaders } from "@/lib/api/helpers";

interface OneSecResp { email?: string }

export const Route = createFileRoute("/api/tempgen/email")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;

        // Try internal.temp-mail.io first
        try {
          const r = await fetch("https://api.internal.temp-mail.io/api/v3/email/new", {
            method: "POST",
            headers: { "User-Agent": "Mozilla/5.0", "Content-Type": "application/json" },
            body: JSON.stringify({ min_name_length: 10, max_name_length: 10 }),
          });
          if (r.ok) {
            const d = await r.json() as { email?: string; token?: string };
            if (d.email) {
              return new Response(JSON.stringify({
                success: true, status: 200, creator: "Popkid API",
                result: { email: d.email, token: d.token, provider: "temp-mail.io" },
                note: "Use ?email=... in /api/tempgen/inbox",
              }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
            }
          }
        } catch { /* fallthrough */ }

        // Fallback: 1secmail
        try {
          const r = await fetch("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1");
          if (r.ok) {
            const d = await r.json() as string[];
            if (d[0]) {
              return new Response(JSON.stringify({
                success: true, status: 200, creator: "Popkid API",
                result: { email: d[0], provider: "1secmail" },
                note: "Use ?email=... in /api/tempgen/inbox",
              }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
            }
          }
        } catch { /* ignore */ }

        return errorResponse("All temp-mail providers failed.", 502);
      },
    },
  },
});

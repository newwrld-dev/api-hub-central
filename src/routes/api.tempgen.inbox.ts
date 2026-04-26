import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey, requireParam, errorResponse, corsHeaders } from "@/lib/api/helpers";

export const Route = createFileRoute("/api/tempgen/inbox")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const email = requireParam(request, "email");
        if (email instanceof Response) return email;

        const [login, domain] = email.split("@");
        if (!login || !domain) return errorResponse("Invalid email", 400);

        // 1secmail check
        if (domain.includes("1secmail") || domain.includes("dcctb") || domain.includes("yoggm")) {
          try {
            const r = await fetch(
              `https://www.1secmail.com/api/v1/?action=getMessages&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`,
            );
            if (r.ok) {
              const d = await r.json();
              return new Response(JSON.stringify({
                success: true, status: 200, creator: "Popkid API",
                email, result: d, count: Array.isArray(d) ? d.length : 0,
              }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
            }
          } catch { /* ignore */ }
        }

        // temp-mail.io check
        try {
          const r = await fetch(
            `https://api.internal.temp-mail.io/api/v3/email/${encodeURIComponent(email)}/messages`,
            { headers: { "User-Agent": "Mozilla/5.0" } },
          );
          if (r.ok) {
            const d = await r.json();
            return new Response(JSON.stringify({
              success: true, status: 200, creator: "Popkid API",
              email, result: d, count: Array.isArray(d) ? d.length : 0,
            }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
          }
        } catch { /* ignore */ }

        return errorResponse("Could not read inbox for this provider.", 502, { email });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders, handleOptions, requireApiKey, requireParam } from "@/lib/api/helpers";

export const Route = createFileRoute("/api/tools/qr")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const text = requireParam(request, "text");
        if (text instanceof Response) return text;
        const url = new URL(request.url);
        const size = url.searchParams.get("size") ?? "300";
        const format = url.searchParams.get("format") ?? "json";

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${encodeURIComponent(size)}x${encodeURIComponent(size)}&data=${encodeURIComponent(text)}`;

        if (format === "image") {
          // Stream the PNG directly
          const res = await fetch(qrUrl);
          return new Response(res.body, {
            headers: {
              "Content-Type": "image/png",
              ...corsHeaders,
            },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            creator: "Popkid API",
            text,
            result: { url: qrUrl, size: `${size}x${size}` },
          }, null, 2),
          { headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      },
    },
  },
});

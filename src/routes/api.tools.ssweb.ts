import { createFileRoute } from "@tanstack/react-router";
import {
  corsHeaders, handleOptions, requireApiKey, requireParam,
} from "@/lib/api/helpers";

export const Route = createFileRoute("/api/tools/ssweb")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const target = requireParam(request, "url");
        if (target instanceof Response) return target;

        // thum.io: free, no-key website screenshots
        const shotUrl = `https://image.thum.io/get/width/1280/crop/800/${target}`;

        const url = new URL(request.url);
        if (url.searchParams.get("format") === "image") {
          const res = await fetch(shotUrl);
          return new Response(res.body, {
            headers: { "Content-Type": "image/png", ...corsHeaders },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            creator: "Popkid API",
            target,
            result: { url: shotUrl, width: 1280, height: 800 },
          }, null, 2),
          { headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      },
    },
  },
});

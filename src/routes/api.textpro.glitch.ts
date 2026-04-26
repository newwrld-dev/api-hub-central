import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

function glitchSvg(text: string): string {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="320" viewBox="0 0 900 320">
    <rect width="900" height="320" fill="#000"/>
    <g font-family="Courier New, monospace" font-size="110" font-weight="900" text-anchor="middle">
      <text x="446" y="180" fill="#ff003c">${safe}</text>
      <text x="454" y="180" fill="#00fff0">${safe}</text>
      <text x="450" y="180" fill="#ffffff">${safe}</text>
    </g>
    <rect x="0" y="120" width="900" height="6" fill="rgba(255,0,60,0.4)"/>
    <rect x="0" y="200" width="900" height="3" fill="rgba(0,255,240,0.4)"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const Route = createFileRoute("/api/textpro/glitch")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const text = requireParam(request, "text");
        if (text instanceof Response) return text;

        const url = new URL(request.url);
        const dataUrl = glitchSvg(text);

        if (url.searchParams.get("format") === "image") {
          return new Response(atob(dataUrl.split(",")[1]), {
            headers: { "Content-Type": "image/svg+xml", ...corsHeaders },
          });
        }

        return new Response(
          JSON.stringify({
            success: true, status: 200, creator: "Popkid API",
            result: { text, image: dataUrl, style: "glitch" },
            note: "Append &format=image to receive raw SVG.",
          }, null, 2),
          { headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      },
    },
  },
});

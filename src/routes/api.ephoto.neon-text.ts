import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey, requireParam, errorResponse, corsHeaders } from "@/lib/api/helpers";

/** Generate a stylized text image via free img.shields.io / dummyimage placeholders.
 *  We don't depend on Ephoto360 (which requires browser automation).
 *  Instead we render a beautiful neon-styled SVG and return the image URL. */
function neonSvg(text: string): string {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="320" viewBox="0 0 900 320">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a001a"/>
        <stop offset="100%" stop-color="#1a0033"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="900" height="320" fill="url(#bg)"/>
    <text x="450" y="180" font-family="Impact, sans-serif" font-size="110" font-weight="900"
      text-anchor="middle" fill="#ff00ff" filter="url(#glow)" stroke="#00ffff" stroke-width="2">${safe}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const Route = createFileRoute("/api/ephoto/neon-text")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const text = requireParam(request, "text");
        if (text instanceof Response) return text;

        const url = new URL(request.url);
        const dataUrl = neonSvg(text);

        if (url.searchParams.get("format") === "image") {
          // Decode and serve as SVG directly
          const svg = atob(dataUrl.split(",")[1]);
          return new Response(svg, {
            headers: { "Content-Type": "image/svg+xml", ...corsHeaders },
          });
        }

        return new Response(
          JSON.stringify({
            success: true, status: 200, creator: "Popkid API",
            result: { text, image: dataUrl, style: "neon" },
            note: "Append &format=image to receive raw SVG.",
          }, null, 2),
          { headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      },
    },
  },
});

export { neonSvg, errorResponse };

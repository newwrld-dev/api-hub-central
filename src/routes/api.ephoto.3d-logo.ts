import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

function logo3dSvg(text: string): string {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 30);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="320" viewBox="0 0 900 320">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd700"/>
        <stop offset="100%" stop-color="#b8860b"/>
      </linearGradient>
    </defs>
    <rect width="900" height="320" fill="#111"/>
    <g font-family="Impact, Arial Black, sans-serif" font-size="120" font-weight="900" text-anchor="middle">
      ${[6,5,4,3,2,1].map(i => `<text x="${450+i}" y="${190+i}" fill="#222">${safe}</text>`).join("")}
      <text x="450" y="190" fill="url(#g)" stroke="#000" stroke-width="2">${safe}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const Route = createFileRoute("/api/ephoto/3d-logo")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const text = requireParam(request, "text");
        if (text instanceof Response) return text;
        const url = new URL(request.url);
        const dataUrl = logo3dSvg(text);
        if (url.searchParams.get("format") === "image") {
          return new Response(atob(dataUrl.split(",")[1]), {
            headers: { "Content-Type": "image/svg+xml", ...corsHeaders },
          });
        }
        return new Response(
          JSON.stringify({
            success: true, status: 200, creator: "Popkid API",
            result: { text, image: dataUrl, style: "3d-logo" },
            note: "Append &format=image to receive raw SVG.",
          }, null, 2),
          { headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      },
    },
  },
});

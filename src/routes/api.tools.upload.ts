import { createFileRoute } from "@tanstack/react-router";
import { handleOptions, requireApiKey, errorResponse, corsHeaders } from "@/lib/api/helpers";

interface CatboxOk { url?: string; error?: string }

export const Route = createFileRoute("/api/tools/upload")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      POST: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;

        const ct = request.headers.get("content-type") ?? "";
        if (!ct.includes("multipart/form-data")) {
          return errorResponse(
            "Send multipart/form-data with a 'file' field.",
            400,
            { example: "curl -X POST 'URL?apikey=popkid' -F 'file=@photo.jpg'" },
          );
        }

        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return errorResponse("Missing 'file' field in form-data.", 400);
          }
          if (file.size > 100 * 1024 * 1024) {
            return errorResponse("File too large (max 100 MB).", 413);
          }

          // Forward to catbox.moe (free, no key, anonymous)
          const fwd = new FormData();
          fwd.append("reqtype", "fileupload");
          fwd.append("fileToUpload", file, file.name || "upload.bin");
          const r = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: fwd });
          const txt = (await r.text()).trim();
          if (!r.ok || !txt.startsWith("http")) {
            return errorResponse(`Upload failed: ${txt.slice(0, 200)}`, 502);
          }

          return new Response(JSON.stringify({
            success: true, status: 200, creator: "Popkid API",
            result: { url: txt, name: file.name, size: file.size, type: file.type, provider: "catbox.moe" },
          }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
        } catch (e) {
          return errorResponse(e instanceof Error ? e.message : "Upload failed", 500);
        }
      },
    },
  },
});

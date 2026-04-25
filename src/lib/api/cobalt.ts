import { errorResponse, requireApiKey, requireParam, corsHeaders } from "./helpers";

const COBALT_INSTANCES = [
  "https://api.cobalt.tools/api/json",
  "https://co.wuk.sh/api/json",
];

interface CobaltResponse {
  status: "stream" | "redirect" | "tunnel" | "picker" | "error" | "rate-limit" | "success";
  url?: string;
  text?: string;
  picker?: { url: string; thumb?: string }[];
}

/**
 * Hit Cobalt (open-source media downloader) and normalize the result.
 */
export async function cobaltDownload(opts: {
  url: string;
  isAudioOnly?: boolean;
  vQuality?: "144" | "240" | "360" | "480" | "720" | "1080" | "max";
  aFormat?: "mp3" | "m4a" | "best";
}) {
  const body = JSON.stringify({
    url: opts.url,
    isAudioOnly: opts.isAudioOnly ?? false,
    vQuality: opts.vQuality ?? "720",
    aFormat: opts.aFormat ?? "mp3",
    filenamePattern: "basic",
  });

  let lastErr = "All Cobalt instances failed";
  for (const endpoint of COBALT_INSTANCES) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Popkid-API/1.0",
        },
        body,
      });
      const data: CobaltResponse = await res.json();
      if (data.status === "error" || data.status === "rate-limit") {
        lastErr = data.text ?? data.status;
        continue;
      }
      if (data.status === "stream" || data.status === "redirect" || data.status === "tunnel") {
        return { downloadUrl: data.url, type: data.status };
      }
      if (data.status === "picker" && data.picker) {
        return { picker: data.picker };
      }
      lastErr = `Unexpected status: ${data.status}`;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "Network error";
    }
  }
  throw new Error(lastErr);
}

/** Generic downloader handler factory. */
export function downloaderHandler(opts: { isAudioOnly?: boolean; vQuality?: "720" | "1080" | "max" } = {}) {
  return async ({ request }: { request: Request }) => {
    const auth = requireApiKey(request);
    if (auth) return auth;
    const url = requireParam(request, "url");
    if (url instanceof Response) return url;

    try {
      new URL(url);
    } catch {
      return errorResponse("Invalid 'url' parameter", 400);
    }

    try {
      const r = await cobaltDownload({
        url,
        isAudioOnly: opts.isAudioOnly,
        vQuality: opts.vQuality,
      });
      return new Response(JSON.stringify({
        success: true,
        creator: "Popkid API",
        source: url,
        result: r,
      }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    } catch (e) {
      return errorResponse(
        e instanceof Error ? e.message : "Downloader failed",
        502,
        { hint: "Some platforms (like FB / IG private posts) may not be supported." },
      );
    }
  };
}

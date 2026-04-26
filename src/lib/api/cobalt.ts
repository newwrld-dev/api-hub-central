import { errorResponse, requireApiKey, requireParam, corsHeaders } from "./helpers";

interface NayanResp {
  status: boolean;
  data?: {
    title?: string;
    thumbnail?: string;
    low?: string;
    high?: string;
    video?: string;
    audio?: string;
    url?: string;
  };
  error?: string;
}

interface DownloadResult {
  title?: string;
  thumbnail?: string;
  downloadUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  picker?: { url: string; thumb?: string }[];
  type?: string;
  source: string;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Popkid/1.0";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    ...init,
    headers: { "User-Agent": UA, Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`Upstream ${r.status}`);
  return r.json() as Promise<T>;
}

/** TikTok via tikwm — very reliable. */
async function tikwmDownload(url: string): Promise<DownloadResult> {
  const d = await fetchJson<{ code: number; msg?: string; data?: { title?: string; cover?: string; play?: string; hdplay?: string; music?: string } }>(
    `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
  );
  if (d.code !== 0 || !d.data) throw new Error(d.msg ?? "TikTok fetch failed");
  return {
    title: d.data.title,
    thumbnail: d.data.cover,
    downloadUrl: d.data.hdplay ?? d.data.play,
    videoUrl: d.data.hdplay ?? d.data.play,
    audioUrl: d.data.music,
    type: "video",
    source: url,
  };
}

/** Universal downloader (YouTube, FB, Twitter, etc.) via Nayan. */
async function nayanDownload(url: string, isAudioOnly = false): Promise<DownloadResult> {
  const d = await fetchJson<NayanResp>(
    `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`,
  );
  if (!d.status || !d.data) throw new Error(d.error?.trim() || "Download failed");
  const dl = isAudioOnly
    ? d.data.audio ?? d.data.low ?? d.data.high ?? d.data.video ?? d.data.url
    : d.data.high ?? d.data.video ?? d.data.low ?? d.data.url ?? d.data.audio;
  return {
    title: d.data.title,
    thumbnail: d.data.thumbnail,
    downloadUrl: dl,
    videoUrl: d.data.high ?? d.data.video ?? d.data.low,
    audioUrl: d.data.audio,
    type: isAudioOnly ? "audio" : "video",
    source: url,
  };
}

/** YouTube MP3 / MP4 via Nayan with quality preference. */
async function youtubeDownload(url: string, isAudioOnly: boolean): Promise<DownloadResult> {
  return nayanDownload(url, isAudioOnly);
}

/** Pinterest scrape: extract image/video URL from page meta tags. */
async function pinterestDownload(url: string): Promise<DownloadResult> {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`Pinterest ${r.status}`);
  const html = await r.text();
  const ogVideo = /<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
  const ogImage = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
  const title = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
  const dl = ogVideo ?? ogImage;
  if (!dl) throw new Error("Could not extract media from Pinterest page");
  return {
    title,
    thumbnail: ogImage,
    downloadUrl: dl,
    videoUrl: ogVideo,
    type: ogVideo ? "video" : "image",
    source: url,
  };
}

/** Instagram via simple oEmbed/scrape fallback. */
async function instagramDownload(url: string): Promise<DownloadResult> {
  // Try Nayan first
  try {
    return await nayanDownload(url, false);
  } catch {
    // Fallback: scrape og tags from public IG post
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`Instagram ${r.status}`);
    const html = await r.text();
    const ogVideo = /<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
    const ogImage = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
    const title = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1];
    const dl = ogVideo ?? ogImage;
    if (!dl) throw new Error("Could not extract media. Post may be private.");
    return { title, thumbnail: ogImage, downloadUrl: dl, type: ogVideo ? "video" : "image", source: url };
  }
}

/** Spotify track via fabdl public endpoint. */
async function spotifyDownload(url: string): Promise<DownloadResult> {
  // fabdl needs origin spoof
  const info = await fetch(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`, {
    headers: { "User-Agent": UA, Origin: "https://spotifydownload.com", Referer: "https://spotifydownload.com/" },
  });
  if (info.ok) {
    const j = await info.json() as { result?: { name?: string; image?: string; gid?: string; id?: string } };
    if (j.result?.gid && j.result?.id) {
      const conv = await fetch(`https://api.fabdl.com/spotify/mp3-convert-task/${j.result.gid}/${j.result.id}`, {
        headers: { Origin: "https://spotifydownload.com", Referer: "https://spotifydownload.com/" },
      });
      if (conv.ok) {
        const cj = await conv.json() as { result?: { download_url?: string; status?: number } };
        if (cj.result?.download_url) {
          return {
            title: j.result.name,
            thumbnail: j.result.image,
            downloadUrl: `https://api.fabdl.com${cj.result.download_url}`,
            audioUrl: `https://api.fabdl.com${cj.result.download_url}`,
            type: "audio",
            source: url,
          };
        }
      }
    }
  }
  // Fallback: just return metadata via Spotify oEmbed
  const oe = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
  if (!oe.ok) throw new Error("Spotify track unavailable");
  const meta = await oe.json() as { title?: string; thumbnail_url?: string };
  return {
    title: meta.title,
    thumbnail: meta.thumbnail_url,
    downloadUrl: undefined,
    type: "audio",
    source: url,
  };
}

/** SoundCloud — return resolve metadata + stream hint. */
async function soundcloudDownload(url: string): Promise<DownloadResult> {
  const oe = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
  if (!oe.ok) throw new Error("SoundCloud track not found");
  const meta = await oe.json() as { title?: string; thumbnail_url?: string; html?: string };
  // Try Nayan for actual audio URL
  try {
    const r = await nayanDownload(url, true);
    return { ...r, title: r.title ?? meta.title, thumbnail: r.thumbnail ?? meta.thumbnail_url };
  } catch {
    return {
      title: meta.title,
      thumbnail: meta.thumbnail_url,
      downloadUrl: undefined,
      type: "audio",
      source: url,
    };
  }
}

type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "twitter"
  | "pinterest"
  | "spotify"
  | "soundcloud"
  | "auto";

export function downloaderHandler(opts: { isAudioOnly?: boolean; vQuality?: string; platform?: Platform } = {}) {
  return async ({ request }: { request: Request }) => {
    const auth = requireApiKey(request);
    if (auth) return auth;
    const url = requireParam(request, "url");
    if (url instanceof Response) return url;

    try {
      new URL(url);
    } catch {
      return errorResponse("Invalid 'url' parameter — must be a full URL", 400);
    }

    const platform = opts.platform ?? detectPlatform(url);
    const isAudio = !!opts.isAudioOnly;

    try {
      let result: DownloadResult;
      switch (platform) {
        case "tiktok":
          result = await tikwmDownload(url);
          break;
        case "instagram":
          result = await instagramDownload(url);
          break;
        case "pinterest":
          result = await pinterestDownload(url);
          break;
        case "spotify":
          result = await spotifyDownload(url);
          break;
        case "soundcloud":
          result = await soundcloudDownload(url);
          break;
        case "youtube":
          result = await youtubeDownload(url, isAudio);
          break;
        default:
          result = await nayanDownload(url, isAudio);
      }
      return new Response(
        JSON.stringify({ success: true, status: 200, creator: "Popkid API", platform, result }, null, 2),
        { headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    } catch (e) {
      return errorResponse(
        e instanceof Error ? e.message : "Downloader failed",
        502,
        {
          hint: "If a public post is private/region-locked, it cannot be downloaded.",
          platform,
        },
      );
    }
  };
}

function detectPlatform(url: string): Platform {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("pinterest.") || u.includes("pin.it")) return "pinterest";
  if (u.includes("spotify.com")) return "spotify";
  if (u.includes("soundcloud.com")) return "soundcloud";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("youtu")) return "youtube";
  return "auto";
}

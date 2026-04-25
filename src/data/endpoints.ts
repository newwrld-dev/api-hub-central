export type Method = "GET" | "POST";

export interface Endpoint {
  name: string;
  path: string;
  method: Method;
  description: string;
  params: { name: string; required?: boolean; example?: string; description?: string }[];
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  count: string;
  endpoints: Endpoint[];
}

// Same-origin: in the browser the tester hits our own /api/* routes.
// In SSR we fall back to a placeholder (it's only used for display).
export const API_BASE =
  typeof window !== "undefined" ? window.location.origin : "https://popkid-api.lovable.app";
export const TEST_API_KEY = "popkid";

export const categories: Category[] = [
  {
    id: "ai",
    title: "AI & Chat",
    icon: "Sparkles",
    tagline: "GPT, Claude, Gemini, Llama and 50+ AI models for chat, vision, code & generation.",
    count: "17+",
    endpoints: [
      { name: "AI Chat", path: "/api/ai/ai", method: "GET", description: "General chat completion across multi-model AI.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "q", required: true, example: "Hello, who are you?", description: "Your prompt" },
      ]},
      { name: "GPT-4o", path: "/api/ai/gpt4o", method: "GET", description: "OpenAI GPT-4o chat completion.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "q", required: true, example: "Explain quantum computing" },
      ]},
      { name: "Gemini Pro", path: "/api/ai/gemini", method: "GET", description: "Google Gemini Pro AI.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "q", required: true, example: "Write a haiku about code" },
      ]},
      { name: "Claude", path: "/api/ai/claude", method: "GET", description: "Anthropic Claude conversational AI.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "q", required: true, example: "Summarize this paragraph..." },
      ]},
      { name: "Image Generator", path: "/api/ai/imagine", method: "GET", description: "Generate AI images from text prompts.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "prompt", required: true, example: "a neon city at night, cyberpunk" },
      ]},
    ],
  },
  {
    id: "downloader",
    title: "Downloaders",
    icon: "Download",
    tagline: "YouTube, TikTok, Instagram, Facebook, X, Spotify, SoundCloud, Pinterest + 20 more.",
    count: "47+",
    endpoints: [
      { name: "YouTube MP3", path: "/api/download/ytmp3", method: "GET", description: "Download YouTube audio as MP3.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
      ]},
      { name: "YouTube MP4", path: "/api/download/ytmp4", method: "GET", description: "Download YouTube video as MP4.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
      ]},
      { name: "TikTok", path: "/api/download/tiktok", method: "GET", description: "Download TikTok video without watermark.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://vm.tiktok.com/xxxxx" },
      ]},
      { name: "Instagram", path: "/api/download/instagram", method: "GET", description: "Download Instagram reels, posts, and stories.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://www.instagram.com/p/xxxx" },
      ]},
      { name: "Facebook", path: "/api/download/facebook", method: "GET", description: "Download Facebook videos in HD/SD.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://facebook.com/watch?v=xxx" },
      ]},
      { name: "Twitter / X", path: "/api/download/twitter", method: "GET", description: "Download videos from X (Twitter).", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://x.com/user/status/xxx" },
      ]},
      { name: "Spotify", path: "/api/download/spotify", method: "GET", description: "Download Spotify tracks as MP3.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://open.spotify.com/track/xxx" },
      ]},
      { name: "SoundCloud", path: "/api/download/soundcloud", method: "GET", description: "Download SoundCloud audio.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://soundcloud.com/user/track" },
      ]},
      { name: "Pinterest", path: "/api/download/pinterest", method: "GET", description: "Download Pinterest images and videos.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://pin.it/xxx" },
      ]},
    ],
  },
  {
    id: "tools",
    title: "Developer Tools",
    icon: "Wrench",
    tagline: "QR codes, screenshots, file upload, URL shortener, obfuscators, carbon code images.",
    count: "50+",
    endpoints: [
      { name: "QR Generator", path: "/api/tools/qr", method: "GET", description: "Generate QR code from text or URL.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "text", required: true, example: "https://popkid.dev" },
      ]},
      { name: "Screenshot", path: "/api/tools/ssweb", method: "GET", description: "Take a full-page website screenshot.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://github.com" },
      ]},
      { name: "URL Shortener", path: "/api/tools/shorten", method: "GET", description: "Shorten long URLs.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "url", required: true, example: "https://very-long-url.example.com/path" },
      ]},
      { name: "File Upload", path: "/api/tools/upload", method: "POST", description: "Upload files up to 100MB and get a CDN URL.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "file", required: true, example: "@file.jpg", description: "multipart/form-data file" },
      ]},
    ],
  },
  {
    id: "search",
    title: "Search & Stalker",
    icon: "Search",
    tagline: "Google, YouTube, GitHub, NPM, Wikipedia, Lyrics + social profile lookups.",
    count: "30+",
    endpoints: [
      { name: "Google Search", path: "/api/search/google", method: "GET", description: "Search the web via Google.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "q", required: true, example: "tanstack start" },
      ]},
      { name: "YouTube Search", path: "/api/search/youtube", method: "GET", description: "Search YouTube videos.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "q", required: true, example: "lofi beats" },
      ]},
      { name: "GitHub Stalk", path: "/api/stalker/github", method: "GET", description: "Fetch a GitHub user profile.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "user", required: true, example: "torvalds" },
      ]},
      { name: "Lyrics", path: "/api/search/lyrics", method: "GET", description: "Find song lyrics.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "q", required: true, example: "blinding lights" },
      ]},
    ],
  },
  {
    id: "image",
    title: "Image Effects",
    icon: "Palette",
    tagline: "Ephoto360, TextPro & PhotoFunia — 845+ unique text & photo effects.",
    count: "845+",
    endpoints: [
      { name: "Neon Text", path: "/api/ephoto/neon-text", method: "GET", description: "Generate a neon glow text effect.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "text", required: true, example: "POPKID" },
      ]},
      { name: "Glitch Text", path: "/api/textpro/glitch", method: "GET", description: "Glitchy cyberpunk text effect.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "text", required: true, example: "HELLO" },
      ]},
      { name: "3D Logo", path: "/api/ephoto/3d-logo", method: "GET", description: "Render text as a 3D logo.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "text", required: true, example: "POPKID API" },
      ]},
    ],
  },
  {
    id: "anime",
    title: "Anime & Fun",
    icon: "Smile",
    tagline: "Waifu pics, anime quotes, jokes, memes, trivia and more.",
    count: "41+",
    endpoints: [
      { name: "Random Waifu", path: "/api/anime/waifu", method: "GET", description: "Get a random waifu image.", params: [
        { name: "apikey", required: true, example: "popkid" },
      ]},
      { name: "Anime Quote", path: "/api/anime/quote", method: "GET", description: "Random anime quote.", params: [
        { name: "apikey", required: true, example: "popkid" },
      ]},
      { name: "Random Joke", path: "/api/fun/joke", method: "GET", description: "A random joke.", params: [
        { name: "apikey", required: true, example: "popkid" },
      ]},
      { name: "Meme", path: "/api/fun/meme", method: "GET", description: "Random trending meme.", params: [
        { name: "apikey", required: true, example: "popkid" },
      ]},
    ],
  },
  {
    id: "sports",
    title: "Sports",
    icon: "Trophy",
    tagline: "Live scores, fixtures, standings & predictions for 51+ leagues.",
    count: "70+",
    endpoints: [
      { name: "Live Scores", path: "/api/sports/livescores", method: "GET", description: "Live football scores.", params: [
        { name: "apikey", required: true, example: "popkid" },
      ]},
      { name: "Standings", path: "/api/sports/standings", method: "GET", description: "League standings table.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "league", required: true, example: "epl" },
      ]},
    ],
  },
  {
    id: "tempgen",
    title: "TempGen & Shortener",
    icon: "Mail",
    tagline: "Disposable email inbox + URL shortening tools.",
    count: "7+",
    endpoints: [
      { name: "Temp Email", path: "/api/tempgen/email", method: "GET", description: "Generate a disposable email address.", params: [
        { name: "apikey", required: true, example: "popkid" },
      ]},
      { name: "Inbox", path: "/api/tempgen/inbox", method: "GET", description: "Read messages from a disposable inbox.", params: [
        { name: "apikey", required: true, example: "popkid" },
        { name: "email", required: true, example: "abc123@tempmail.io" },
      ]},
    ],
  },
];

export const totalEndpoints = "1,210+";

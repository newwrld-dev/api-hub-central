import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CodeBlock } from "@/components/CodeBlock";
import { categories, totalEndpoints, API_BASE, TEST_API_KEY } from "@/data/endpoints";
import {
  Sparkles, Download, Wrench, Search, Palette, Smile, Trophy, Mail,
  ArrowRight, Zap, ShieldCheck, Globe, Code2, Copy, KeyRound, Server, Activity,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Popkid API — Free Multi-Purpose REST API Platform" },
      { name: "description", content: "1,210+ free API endpoints: AI chat, MP3/MP4 downloaders, social media, image effects, search, anime, sports & more. Free apikey: popkid." },
      { property: "og:title", content: "Popkid API — Free REST API Platform" },
      { property: "og:description", content: "1,210+ endpoints — AI, downloaders, tools, search & more. Free forever." },
    ],
  }),
  component: Home,
});

const iconMap = { Sparkles, Download, Wrench, Search, Palette, Smile, Trophy, Mail };

function Home() {
  return (
    <AppLayout>
      <Hero />
      <BaseUrlSection />
      <StatsSection />
      <CategoriesSection />
      <QuickStartSection />
      <FaqSection />
      <Footer />
    </AppLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative px-6 lg:px-12 pt-20 pb-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-border mb-6">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">v4.0.0 — {totalEndpoints} live endpoints</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="gradient-text">Popkid API</span>
        </h1>
        <p className="text-sm font-mono text-muted-foreground tracking-[0.3em] uppercase mb-6">
          Multi-Purpose REST API Platform
        </p>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
          Build powerful apps & bots with our comprehensive API. AI chat, MP3 / MP4 downloaders,
          all social media platforms, image effects, developer tools — all free with one HTTP request.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {["GET Requests", "POST Requests", "JSON Responses", "API Key Auth", "File Uploads"].map((b) => (
            <span key={b} className="text-xs px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground">
              ✓ {b}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold glow hover:opacity-90 transition"
          >
            <Code2 className="h-4 w-4" /> Read Documentation
          </Link>
          <Link
            to="/endpoints"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-border font-semibold hover:bg-muted/50 transition"
          >
            <Sparkles className="h-4 w-4" /> Explore Endpoints
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-accent/50 text-accent font-semibold hover:bg-accent/10 transition"
          >
            <KeyRound className="h-4 w-4" /> Get API Key
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> 99.9% Uptime</span>
          <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Fast Response</span>
          <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Global CDN</span>
          <span className="flex items-center gap-2"><Code2 className="h-4 w-4 text-accent" /> Developer Friendly</span>
        </div>
      </div>
    </section>
  );
}

function BaseUrlSection() {
  const [copied, setCopied] = useState(false);
  return (
    <section className="px-6 lg:px-12 py-16 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="h-8 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full" />
          Base URL
        </h2>
        <p className="text-muted-foreground">All API requests are made to this base URL. Include your API key as a query parameter.</p>
      </div>

      <div className="rounded-2xl gradient-border p-6 md:p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-bold text-lg mb-1">API Base URL</div>
            <div className="text-sm text-muted-foreground mb-3">Use this as the root for all endpoint requests.</div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground">🔒 HTTPS Only</span>
              <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground">⇄ REST API</span>
              <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground">{`</> JSON Format`}</span>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(API_BASE);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/40 text-primary font-mono text-sm hover:bg-primary/20 transition"
          >
            <code>{API_BASE}</code>
            <Copy className="h-4 w-4" />
            {copied && <span className="text-xs">copied!</span>}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-method-get/10 border border-primary/30">
            <div className="font-mono font-bold text-primary mb-1">GET</div>
            <div className="text-sm text-muted-foreground">Fetch data, search, download, generate</div>
          </div>
          <div className="p-4 rounded-xl bg-method-post/10 border border-accent/30">
            <div className="font-mono font-bold text-accent mb-1">POST</div>
            <div className="text-sm text-muted-foreground">Upload files, submit data, process content</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { icon: Server, label: "Server Status", value: "Online" },
    { icon: Activity, label: "Endpoints", value: totalEndpoints },
    { icon: Zap, label: "Response Time", value: "167ms" },
    { icon: KeyRound, label: "Auth Method", value: "API Key" },
  ];
  return (
    <section className="px-6 lg:px-12 py-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-5 bg-card border border-border hover:border-primary/40 transition">
              <Icon className="h-5 w-5 text-primary mb-3" />
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</div>
              <div className="text-xl font-bold mt-1 gradient-text">{s.value}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="px-6 lg:px-12 py-16 max-w-6xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="h-8 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full" />
          API Categories
        </h2>
        <p className="text-muted-foreground">Thousands of endpoints across every category — pick yours.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c) => {
          const Icon = iconMap[c.icon as keyof typeof iconMap] ?? Sparkles;
          return (
            <Link
              key={c.id}
              to="/endpoints/$category"
              params={{ category: c.id }}
              className="group rounded-2xl p-6 bg-card border border-border hover:border-primary/50 hover:shadow-[var(--shadow-glow)] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center border border-primary/30">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-mono text-accent px-2 py-1 rounded-md bg-accent/10 border border-accent/30">
                  {c.count}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:gradient-text transition">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.tagline}</p>
              <div className="text-xs text-primary flex items-center gap-1 font-medium">
                Explore <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function QuickStartSection() {
  const jsCode = `// Using fetch (JavaScript)
const res = await fetch('${API_BASE}/api/ai/ai?apikey=${TEST_API_KEY}&q=Hello');
const data = await res.json();
console.log(data.result);`;

  const ytCode = `# Using Python
import requests
r = requests.get('${API_BASE}/api/download/ytmp3', params={
    'apikey': '${TEST_API_KEY}',
    'url': 'https://youtube.com/watch?v=dQw4w9WgXcQ'
})
print(r.json())`;

  const botCode = `// WhatsApp / Telegram bot snippet (Node.js)
const axios = require('axios');

async function downloadMp4(url) {
  const { data } = await axios.get('${API_BASE}/api/download/ytmp4', {
    params: { apikey: '${TEST_API_KEY}', url }
  });
  return data.result.download_url;
}`;

  return (
    <section className="px-6 lg:px-12 py-16 max-w-6xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="h-8 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full" />
          Quick Start
        </h2>
        <p className="text-muted-foreground">Make your first call in seconds. Zero setup.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="text-xs font-mono text-primary mb-2">EXAMPLE — AI CHAT (GET)</div>
          <CodeBlock code={jsCode} language="javascript" />
        </div>
        <div>
          <div className="text-xs font-mono text-primary mb-2">EXAMPLE — YOUTUBE MP3 (GET)</div>
          <CodeBlock code={ytCode} language="python" />
        </div>
        <div className="lg:col-span-2">
          <div className="text-xs font-mono text-accent mb-2">USE IN BOTS — WHATSAPP / TELEGRAM / DISCORD</div>
          <CodeBlock code={botCode} language="javascript" />
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    { q: "Is Popkid API free to use?", a: "Yes — 100% free. Use the test API key 'popkid' immediately on every endpoint. No signup needed." },
    { q: "What programming languages can I use?", a: "Any language with HTTP support: JavaScript/TypeScript, Python, PHP, Go, Rust, Java, Dart, Ruby, C#. Responses are JSON." },
    { q: "Can I use it in WhatsApp / Telegram / Discord bots?", a: "Absolutely. The API was designed for bot developers — see the Documentation page for ready-to-paste bot snippets." },
    { q: "Does it support MP3 and MP4 downloads?", a: "Yes — YouTube MP3, YouTube MP4, TikTok, Instagram, Facebook, X, Spotify, SoundCloud and more, all free." },
    { q: "How reliable is the API?", a: "99.9% uptime, automatic failover, and continuous monitoring across all 1,210+ endpoints." },
  ];
  return (
    <section className="px-6 lg:px-12 py-16 max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="h-8 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full" />
          Frequently Asked
        </h2>
      </div>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-xl bg-card border border-border p-5 hover:border-primary/30 transition">
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
              {f.q}
              <span className="text-primary text-xl group-open:rotate-45 transition">+</span>
            </summary>
            <p className="text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 lg:px-12 py-10 border-t border-border mt-10">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} <span className="gradient-text font-bold">Popkid API</span> — Free for everyone.
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/docs" className="hover:text-foreground">Docs</Link>
          <Link to="/endpoints" className="hover:text-foreground">Endpoints</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Sparkles, Plus, Wrench } from "lucide-react";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Popkid API" },
      { name: "description", content: "Latest releases, new endpoints, and improvements to Popkid API." },
    ],
  }),
  component: Changelog,
});

const releases = [
  { v: "v4.0.0", date: "April 2026", icon: Sparkles, type: "Major", color: "primary",
    notes: ["Brand new design system & dashboard", "Live endpoint tester on every endpoint", "Bot-ready code snippets (WhatsApp, Telegram, Discord)"] },
  { v: "v3.5.0", date: "March 2026", icon: Plus, type: "Feature", color: "accent",
    notes: ["+200 image effect endpoints (Ephoto360 & TextPro)", "Spotify and SoundCloud downloaders", "AI image generation (DALL·E, Stable Diffusion)"] },
  { v: "v3.2.1", date: "February 2026", icon: Wrench, type: "Patch", color: "secondary",
    notes: ["Faster YouTube MP3/MP4 downloader", "Improved Instagram reel parsing", "Lower latency on AI endpoints"] },
];

function Changelog() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-12 py-12 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-3 gradient-text">Changelog</h1>
        <p className="text-muted-foreground mb-10">Every release is free for everyone, forever.</p>

        <div className="relative space-y-8 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-px before:bg-border">
          {releases.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.v} className="relative pl-14">
                <div className="absolute left-0 top-0 h-11 w-11 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center glow">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="rounded-2xl p-6 bg-card border border-border">
                  <div className="flex items-baseline gap-3 flex-wrap mb-3">
                    <span className="text-xl font-bold gradient-text">{r.v}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                      {r.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {r.notes.map((n) => (
                      <li key={n} className="flex gap-2">
                        <span className="text-primary">▸</span> {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

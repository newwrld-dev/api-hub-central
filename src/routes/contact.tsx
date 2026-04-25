import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Mail, MessageCircle, Github, Send, KeyRound } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Popkid API" },
      { name: "description", content: "Get in touch with the Popkid API team for custom plans, support, or partnerships." },
    ],
  }),
  component: Contact,
});

const channels = [
  { icon: Mail, label: "Email", value: "hello@popkid.dev", href: "mailto:hello@popkid.dev" },
  { icon: MessageCircle, label: "WhatsApp", value: "Chat on WhatsApp", href: "#" },
  { icon: Send, label: "Telegram", value: "@popkidapi", href: "#" },
  { icon: Github, label: "GitHub", value: "github.com/popkid", href: "#" },
];

function Contact() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-12 py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-3 gradient-text">Get In Touch</h1>
        <p className="text-muted-foreground mb-10">
          Need a custom rate limit, found an issue, or want to partner? Reach out below.
        </p>

        <div className="rounded-2xl p-8 mb-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/30">
          <KeyRound className="h-8 w-8 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Free API Key</h2>
          <p className="text-muted-foreground mb-4">
            You don't need to contact us to start — use the free key on every endpoint right now:
          </p>
          <code className="text-2xl font-mono font-bold text-primary block">popkid</code>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.label}
                href={c.href}
                className="group rounded-2xl p-5 bg-card border border-border hover:border-primary/50 transition flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center border border-primary/30">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</div>
                  <div className="font-semibold group-hover:gradient-text">{c.value}</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, BookOpen, History, Mail, Sparkles, Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/endpoints", label: "Endpoints", icon: Compass },
  { to: "/docs", label: "Documentation", icon: BookOpen },
  { to: "/changelog", label: "Changelog", icon: History },
  { to: "/contact", label: "Contact", icon: Mail },
] as const;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-72 glass border-r border-border transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent grid place-items-center glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight gradient-text">Popkid API</div>
              <div className="text-[11px] text-muted-foreground tracking-widest uppercase">
                Free Forever ⚡
              </div>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {nav.map((item) => {
            const active = location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground gradient-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="rounded-xl p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-border">
            <div className="text-xs text-muted-foreground mb-2">Free test API key</div>
            <code className="block text-sm font-mono font-bold text-primary">popkid</code>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" /> Built with ♥ by Popkid
          </a>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden fixed top-4 right-4 z-50 h-10 w-10 grid place-items-center rounded-xl glass border border-border"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

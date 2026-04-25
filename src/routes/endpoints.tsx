import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { categories } from "@/data/endpoints";
import {
  Sparkles, Download, Wrench, Search, Palette, Smile, Trophy, Mail, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/endpoints")({
  head: () => ({
    meta: [
      { title: "Endpoints — Popkid API" },
      { name: "description", content: "Browse all 1,210+ Popkid API endpoints — AI, downloaders, image effects, search, sports, and more." },
    ],
  }),
  component: EndpointsLayout,
});

const iconMap = { Sparkles, Download, Wrench, Search, Palette, Smile, Trophy, Mail };

function EndpointsLayout() {
  const location = useLocation();
  const isIndex = location.pathname === "/endpoints" || location.pathname === "/endpoints/";

  return (
    <AppLayout>
      <div className="px-6 lg:px-12 py-12 max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 gradient-text">API Endpoints</h1>
          <p className="text-muted-foreground">
            Pick a category, try every endpoint live with the built-in tester. Free key:{" "}
            <code className="text-primary font-mono">popkid</code>.
          </p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="space-y-1.5 lg:sticky lg:top-6 lg:self-start">
            <Link
              to="/endpoints"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                isIndex ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-4 w-4" /> All Categories
            </Link>
            {categories.map((c) => {
              const Icon = iconMap[c.icon as keyof typeof iconMap] ?? Sparkles;
              const active = location.pathname === `/endpoints/${c.id}`;
              return (
                <Link
                  key={c.id}
                  to="/endpoints/$category"
                  params={{ category: c.id }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                    active ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{c.title}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{c.count}</span>
                </Link>
              );
            })}
          </aside>

          <div>
            {isIndex ? <CategoryGrid /> : <Outlet />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function CategoryGrid() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {categories.map((c) => {
        const Icon = iconMap[c.icon as keyof typeof iconMap] ?? Sparkles;
        return (
          <Link
            key={c.id}
            to="/endpoints/$category"
            params={{ category: c.id }}
            className="group rounded-2xl p-6 bg-card border border-border hover:border-primary/50 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center border border-primary/30">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-mono text-accent">{c.count}</span>
            </div>
            <div className="font-bold mb-1 group-hover:gradient-text">{c.title}</div>
            <p className="text-sm text-muted-foreground">{c.tagline}</p>
          </Link>
        );
      })}
    </div>
  );
}

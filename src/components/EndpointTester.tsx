import { useState } from "react";
import type { Endpoint } from "@/data/endpoints";
import { API_BASE } from "@/data/endpoints";
import { Play, Loader2 } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { cn } from "@/lib/utils";

export function EndpointTester({ endpoint }: { endpoint: Endpoint }) {
  const initial: Record<string, string> = {};
  endpoint.params.forEach((p) => (initial[p.name] = p.example ?? ""));
  const [values, setValues] = useState(initial);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const buildUrl = () => {
    const qs = new URLSearchParams();
    endpoint.params.forEach((p) => {
      if (p.name === "file") return;
      if (values[p.name]) qs.set(p.name, values[p.name]);
    });
    return `${API_BASE}${endpoint.path}?${qs.toString()}`;
  };

  const handleTest = async () => {
    setLoading(true);
    setResponse("");
    setStatus(null);
    try {
      const res = await fetch(buildUrl());
      setStatus(res.status);
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text.slice(0, 4000));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setResponse(JSON.stringify({ error: msg, hint: "Endpoint may be a demo. Use a real API server with the same path schema." }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const methodColor = endpoint.method === "GET" ? "bg-method-get/20 text-primary border-primary/40" : "bg-method-post/20 text-accent border-accent/40";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
      <div className="p-5 border-b border-border flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold font-mono border", methodColor)}>
              {endpoint.method}
            </span>
            <h3 className="text-lg font-bold">{endpoint.name}</h3>
          </div>
          <code className="text-xs text-muted-foreground font-mono break-all">{endpoint.path}</code>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{endpoint.description}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          {endpoint.params.map((p) => (
            <label key={p.name} className="block">
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 mb-1.5">
                {p.name}
                {p.required && <span className="text-accent">*</span>}
              </span>
              <input
                value={values[p.name] ?? ""}
                onChange={(e) => setValues({ ...values, [p.name]: e.target.value })}
                placeholder={p.example}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleTest}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition glow"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Send Test Request
          </button>
          {status !== null && (
            <span
              className={cn(
                "text-xs font-mono px-2.5 py-1 rounded-md border",
                status >= 200 && status < 300
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-destructive/15 text-destructive border-destructive/30",
              )}
            >
              {status}
            </span>
          )}
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-2 font-mono">REQUEST URL</div>
          <CodeBlock code={buildUrl()} language="url" />
        </div>

        {response && (
          <div>
            <div className="text-xs text-muted-foreground mb-2 font-mono">RESPONSE</div>
            <CodeBlock code={response} language="json" />
          </div>
        )}
      </div>
    </div>
  );
}

// Standalone Node server for Render deployment.
// Reuses ALL TanStack Start /api/* route handlers without the Cloudflare bundler.
//
// Run: node server/render.mjs
// Render: Build = `npm install`, Start = `node server/render.mjs`

import http from "node:http";
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_DIR = path.resolve(__dirname, "../src/routes");
const PORT = process.env.PORT || 10000;

// ---------- Load all api.*.ts route handlers via tsx ----------
// We use tsx (TypeScript loader) so we can import .ts files at runtime.
import { register } from "tsx/esm/api";
register();

// Convert "api.ai.ai.ts" -> "/api/ai/ai"
// Convert "api.$.ts" -> "/api/*" (catch-all)
function fileToPath(file) {
  const base = file.replace(/\.ts$/, "");
  const segs = base.split(".");
  return "/" + segs.map((s) => (s === "$" ? "*" : s)).join("/");
}

const routes = []; // { pattern: RegExp, methods: { GET, POST, OPTIONS, ... }, isCatchAll }

const files = readdirSync(ROUTES_DIR)
  .filter((f) => f.startsWith("api.") && f.endsWith(".ts"));

console.log(`[render] Loading ${files.length} API routes...`);

for (const file of files) {
  try {
    const mod = await import(pathToFileURL(path.join(ROUTES_DIR, file)).href);
    const route = mod.Route;
    const handlers = route?.options?.server?.handlers;
    if (!handlers) {
      console.warn(`[render] No handlers in ${file}`);
      continue;
    }
    const urlPath = fileToPath(file);
    const isCatchAll = urlPath.endsWith("/*");
    // Build regex: /api/ai/ai -> ^/api/ai/ai/?$
    //              /api/*     -> ^/api/(.*)$
    let re;
    if (isCatchAll) {
      re = new RegExp("^" + urlPath.replace("/*", "/(.*)") + "$");
    } else {
      re = new RegExp("^" + urlPath + "/?$");
    }
    routes.push({ pattern: re, methods: handlers, isCatchAll, urlPath });
  } catch (err) {
    console.error(`[render] Failed to load ${file}:`, err.message);
  }
}

// Sort: specific routes before catch-all
routes.sort((a, b) => (a.isCatchAll ? 1 : 0) - (b.isCatchAll ? 1 : 0));

console.log(`[render] Loaded routes:`);
for (const r of routes) console.log(`  ${r.urlPath}`);

// ---------- Convert Node IncomingMessage -> Web Request ----------
function nodeToWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = `${proto}://${host}${req.url}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((vv) => headers.append(k, vv));
    else if (v != null) headers.set(k, String(v));
  }
  const init = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = new ReadableStream({
      start(controller) {
        req.on("data", (chunk) => controller.enqueue(chunk));
        req.on("end", () => controller.close());
        req.on("error", (e) => controller.error(e));
      },
    });
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function sendWebResponse(webRes, nodeRes) {
  nodeRes.statusCode = webRes.status;
  webRes.headers.forEach((v, k) => nodeRes.setHeader(k, v));
  const buf = Buffer.from(await webRes.arrayBuffer());
  nodeRes.end(buf);
}

// ---------- HTTP server ----------
const server = http.createServer(async (req, nodeRes) => {
  try {
    const urlObj = new URL(req.url, "http://x");
    const pathname = urlObj.pathname;

    // Health check
    if (pathname === "/" || pathname === "/health") {
      nodeRes.setHeader("Content-Type", "application/json");
      nodeRes.end(
        JSON.stringify({
          name: "Popkid API",
          status: "ok",
          message: "API is live. Browse /api/* endpoints.",
          docs: "https://sweet-download-zone.lovable.app/docs",
          endpoints_count: routes.length,
          example: `${urlObj.protocol}//${req.headers.host}/api/ai/ai?apikey=popkid&q=hello`,
        }, null, 2),
      );
      return;
    }

    // Match a route
    let matched = null;
    let splat = "";
    for (const r of routes) {
      const m = pathname.match(r.pattern);
      if (m) {
        matched = r;
        if (r.isCatchAll) splat = m[1] || "";
        break;
      }
    }

    if (!matched) {
      nodeRes.statusCode = 404;
      nodeRes.setHeader("Content-Type", "application/json");
      nodeRes.end(JSON.stringify({ success: false, status: 404, message: "Not found" }));
      return;
    }

    const method = (req.method || "GET").toUpperCase();
    let handler = matched.methods[method];
    // TanStack supports `handlers: ({createHandlers}) => createHandlers({...})` form,
    // but our routes use plain object form, so direct lookup is fine.

    if (!handler) {
      nodeRes.statusCode = 405;
      nodeRes.setHeader("Content-Type", "application/json");
      nodeRes.end(JSON.stringify({ success: false, status: 405, message: `Method ${method} not allowed` }));
      return;
    }

    const webReq = nodeToWebRequest(req);
    const params = matched.isCatchAll ? { _splat: splat } : {};
    const webRes = await handler({ request: webReq, params, context: {} });

    if (!(webRes instanceof Response)) {
      nodeRes.statusCode = 500;
      nodeRes.end(JSON.stringify({ success: false, message: "Handler did not return a Response" }));
      return;
    }
    await sendWebResponse(webRes, nodeRes);
  } catch (err) {
    console.error("[render] Request error:", err);
    nodeRes.statusCode = 500;
    nodeRes.setHeader("Content-Type", "application/json");
    nodeRes.end(JSON.stringify({
      success: false,
      status: 500,
      message: err?.message || "Internal server error",
    }));
  }
});

server.listen(PORT, () => {
  console.log(`[render] Popkid API listening on http://0.0.0.0:${PORT}`);
});

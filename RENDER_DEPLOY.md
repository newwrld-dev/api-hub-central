# Deploying Popkid API to Render

Your `/api/*` endpoints can run on Render alongside Lovable hosting.
Both will serve the same endpoints from different URLs.

## 1. Push this repo to GitHub
Use the GitHub button in the top-right of the Lovable editor.

## 2. Create the Render service

Go to https://dashboard.render.com → **New +** → **Web Service** → connect your repo.

Render will auto-detect `render.yaml`. If it doesn't, fill in manually:

| Setting          | Value                              |
| ---------------- | ---------------------------------- |
| **Runtime**      | Node                               |
| **Build Command**| `npm install`                      |
| **Start Command**| `node server/render.mjs`           |
| **Node Version** | `20` (set in Environment)          |
| **Plan**         | Free is fine                       |

## 3. Add environment variables

In Render → your service → **Environment**, add:

| Key                | Value                                                |
| ------------------ | ---------------------------------------------------- |
| `LOVABLE_API_KEY`  | (get this from Lovable → Cloud → AI → API key)       |
| `NODE_VERSION`     | `20`                                                 |

> Only `LOVABLE_API_KEY` is required for the AI endpoints
> (`/api/ai/ai`, `/api/ai/gpt4o`, `/api/ai/gemini`, `/api/ai/claude`, `/api/ai/imagine`).
> All other endpoints work without any extra config.

## 4. Deploy

Click **Create Web Service**. First build takes ~2 minutes.
You'll get a public URL like `https://popkid-api.onrender.com`.

## 5. Test

```bash
curl "https://popkid-api.onrender.com/api/fun/joke?apikey=popkid"
curl "https://popkid-api.onrender.com/api/ai/ai?apikey=popkid&q=hello"
curl "https://popkid-api.onrender.com/api/download/ytmp3?apikey=popkid&url=..."
```

## Notes

- **Free plan sleeps after 15 min idle** — first request after sleep takes ~30s to cold-start.
  Upgrade to Starter ($7/mo) to keep it always-on.
- The Node server (`server/render.mjs`) reuses 100% of your TanStack Start route handlers.
  Adding a new endpoint in `src/routes/api.*.ts` automatically works on Render after redeploy.
- This is **completely independent** from Lovable publishing — both deployments stay in sync
  whenever you push to GitHub.

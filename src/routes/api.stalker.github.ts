import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, handleOptions, requireApiKey, requireParam, corsHeaders } from "@/lib/api/helpers";

interface GitHubUser {
  login: string; id: number; avatar_url: string; html_url: string;
  name?: string; company?: string; blog?: string; location?: string;
  bio?: string; public_repos: number; followers: number; following: number;
  created_at: string;
}

export const Route = createFileRoute("/api/stalker/github")({
  server: {
    handlers: {
      OPTIONS: async () => handleOptions(),
      GET: async ({ request }) => {
        const auth = requireApiKey(request);
        if (auth) return auth;
        const user = requireParam(request, "user");
        if (user instanceof Response) return user;

        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
          headers: { "User-Agent": "Popkid-API" },
        });
        if (res.status === 404) return errorResponse(`GitHub user '${user}' not found`, 404);
        if (!res.ok) return errorResponse(`GitHub error: ${res.status}`, 502);
        const d: GitHubUser = await res.json();
        return new Response(JSON.stringify({
          success: true,
          creator: "Popkid API",
          result: {
            username: d.login,
            name: d.name,
            avatar: d.avatar_url,
            url: d.html_url,
            bio: d.bio,
            company: d.company,
            blog: d.blog,
            location: d.location,
            repos: d.public_repos,
            followers: d.followers,
            following: d.following,
            joined: d.created_at,
          },
        }, null, 2), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      },
    },
  },
});

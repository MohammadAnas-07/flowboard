import type { NextConfig } from "next";

// The backend sets its session cookie on its own origin. Without this
// rewrite, browser requests to NEXT_PUBLIC_API_URL are cross-origin, so the
// cookie never becomes visible to Vercel's own server-side code (proxy.ts,
// server components) — it's scoped to onrender.com, not vercel.app. Routing
// client calls through same-origin /api/* here makes Vercel's proxy the
// apparent origin, so the resulting Set-Cookie lands as first-party.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  /* config options here */
  agentRules: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

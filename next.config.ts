import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client-side API origin (same as CRA). Empty string = same-origin `/api/*` (see BACKEND_URL proxy).
  env: {
    REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL ?? "",
  },
  turbopack: {
    resolveAlias: {
      "react-router-dom": "./src/lib/react-router-dom-compat.tsx",
    },
  },
};

export default nextConfig;

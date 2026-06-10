import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Remote hosts allowed for next/image. lh3.googleusercontent.com = real Google
    // profile photos (prod); i.pravatar.cc + picsum.photos = local seed/demo content.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      // Supabase Storage (kudo images / future avatars) — prod project subdomains.
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  turbopack: {
    rules: {
      // `import Icon from "...svg?react"` -> React component (SVGR).
      // Monochrome icons use fill="white"; map it to currentColor so they
      // inherit text colour. Plain `import x from "...svg"` stays a URL
      // (next/image static import), so this only touches `?react` imports.
      "*.svg": [
        {
          condition: { query: /react/ },
          loaders: [
            {
              loader: "@svgr/webpack",
              options: {
                dimensions: false,
                replaceAttrValues: {
                  white: "currentColor",
                  "#fff": "currentColor",
                  "#FFF": "currentColor",
                  "#FFFFFF": "currentColor",
                },
              },
            },
          ],
          as: "*.js",
        },
      ],
    },
  },
};

export default nextConfig;

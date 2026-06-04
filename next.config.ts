import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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

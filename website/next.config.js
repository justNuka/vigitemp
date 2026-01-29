// next.config.mjs
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withNextIntl = createNextIntlPlugin(
  // optionnel : si le fichier n'est pas à l'emplacement par défaut
  "./src/i18n/request.ts"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    // React strict mode
    reactStrictMode: true,
    output: "standalone",
    // Keep the tracing root scoped to the website folder to avoid pulling in repo-wide files.
    outputFileTracingRoot: __dirname,
    outputFileTracingExcludes: {
        "/**": [
            "**/docs/**",
            "**/installer/**",
            "**/scripts/**",
        ],
    },
    outputFileTracingIncludes: {
        "/": [
            "node_modules/styled-jsx/**",
            "node_modules/@swc/helpers/**",
            "node_modules/@next/env/**",
        ],
    },
    // Autoriser le dev mode sur une IP
    allowedDevOrigins: [
      // Next compare parfois sans scheme/port selon le contexte (HMR/_next/*),
      // donc on liste les variantes.
      "192.168.63.144",
      "192.168.63.144:3000",
      "http://192.168.63.144",
      "http://192.168.63.144:3000",
      "http://192.168.63.124",
      "http://192.168.63.124:3000",
      "localhost",
      "http://localhost:3000",
      "dev.vigitemp",
      "test.vigitemp",
      "https://dev.vigitemp",
      "https://test.vigitemp",
    ],
    // Masquer les warnings de source maps en dev (faux positifs Next.js 16)
    // Dev-only: keep entries longer to reduce unexpected churn/refresh while the tab is idle.
    // (These settings do not affect production builds.)
    onDemandEntries: {
        maxInactiveAge: 15 * 60 * 1000, // 15 minutes
        pagesBufferLength: 5,
    },
    images: {
        remotePatterns: [
            {
                hostname: "media.geeksforgeeks.org",
            },
        ],
    },
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    cacheComponents: true,
};


export default withNextIntl(nextConfig);

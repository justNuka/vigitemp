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
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: blob: https:",
                            "font-src 'self' data:",
                            "connect-src 'self' http://127.0.0.1:8000 http://localhost:8000",
                            "frame-src 'self' blob:",
                            "frame-ancestors 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                        ].join("; "),
                    },
                ],
            },
        ]
    },
    cacheComponents: true,
};


export default withNextIntl(nextConfig);

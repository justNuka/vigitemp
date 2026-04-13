// next.config.mjs
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withNextIntl = createNextIntlPlugin(
  // optionnel : si le fichier n'est pas ? l'emplacement par d?faut
  "./src/i18n/request.ts"
);

function parseListEnv(name, fallback = []) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  return raw
    .split(/[\r\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

const defaultAllowedDevOrigins = [
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
];

const allowedDevOrigins = parseListEnv(
  "VIGITEMP_ALLOWED_DEV_ORIGINS",
  defaultAllowedDevOrigins
);

const connectSrcValues = [
  "'self'",
  ...parseListEnv("VIGITEMP_CSP_CONNECT_SRC", [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
  ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    distDir: ".next",
    outputFileTracingRoot: __dirname,
    output: "standalone",
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
    allowedDevOrigins,
    onDemandEntries: {
        maxInactiveAge: 15 * 60 * 1000,
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
                            `connect-src ${connectSrcValues.join(" ")}`,
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

// next.config.mjs
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  // optionnel : si le fichier n'est pas à l'emplacement par défaut
  // "./src/i18n/request.ts"
);


/** @type {import('next').NextConfig} */
const nextConfig = {
    // Masquer les warnings de source maps en dev (faux positifs Next.js 16)
    onDemandEntries: {
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 2,
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

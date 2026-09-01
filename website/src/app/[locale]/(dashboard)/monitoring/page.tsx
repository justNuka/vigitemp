// Physical fallback for the localized English pathname (/en/monitoring).
// next-intl normally rewrites it to /[locale]/surveillance, but keeping a
// route module here also makes direct requests work in standalone deployments.
export { generateMetadata } from "../surveillance/page"
export { default } from "../surveillance/page"

import { redirect } from "next/navigation";

import { buildLocalizedPath } from "@/i18n/pathnames";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

function resolveLocale(locale: string): Locale {
  if (routing.locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return routing.defaultLocale;
}

export default async function FirstLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = resolveLocale(locale);

  redirect(buildLocalizedPath("/force-password-change", safeLocale));
}

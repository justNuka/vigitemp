"use client";

import { useTranslations as useNextIntlTranslations } from "next-intl";

export function useTranslations() {
  return useNextIntlTranslations();
}

/**
 * Hook helper pour récupérer une traduction simple
 * Exemple: const title = useTranslation('pageHeader.title');
 */
export function useTranslation(key: string): string {
  const t = useNextIntlTranslations();
  return t(key);
}

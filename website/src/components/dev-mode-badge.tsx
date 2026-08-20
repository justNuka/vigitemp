"use client";

import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { Beaker } from "lucide-react";
import { useTranslations } from "next-intl";

export function DevModeBadge() {
  const t = useTranslations("testPages.index");

  if (!FEATURE_FLAGS.enableTestPages) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-lg border border-warning bg-warning/10 px-3 py-2 text-sm font-medium text-warning shadow-lg backdrop-blur-sm">
      <Beaker className="h-4 w-4" />
      <span>{t("title")}</span>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DevModeBadge } from "@/components/dev-mode-badge";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { UiMotionShowcaseClient } from "./_components/ui-motion-showcase-client";

export default async function UiMotionShowcasePage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound();
  }

  const t = await getTranslations("testPages.uiMotion");

  return (
    <div className="flex min-h-full flex-col space-y-6 p-4 md:p-6">
      <DevModeBadge />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("page_title")}</h1>
        <p className="max-w-4xl text-muted-foreground">{t("page_description")}</p>
      </div>

      <UiMotionShowcaseClient />
    </div>
  );
}

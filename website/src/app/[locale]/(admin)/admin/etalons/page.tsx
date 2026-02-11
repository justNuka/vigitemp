"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLicense } from "@/components/license/license-provider";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StandardsClient } from "./standards-client";

export default function EtalonsPage() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const { license, loading } = useLicense();

  const edition = (license?.edition || "standard").trim().toLowerCase();
  const isBlocked = useMemo(() => edition === "one" || edition === "pack", [edition]);

  if (loading) {
    return null;
  }

  if (isBlocked) {
    const blockedTitle = locale === "fr" ? "Gestion des étalons indisponible" : "Standards management unavailable";
    const blockedDescription =
      locale === "fr"
        ? "Cette page n'est pas disponible avec votre licence actuelle."
        : "This page is not available with your current license.";

    return (
      <>
        <PageHeader title={blockedTitle} description={blockedDescription} />
        <div className="space-y-6 p-6">
          <Card>
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <p className="text-sm text-muted-foreground">{blockedDescription}</p>
              <Button asChild variant="outline">
                <Link href="/admin">{tCommon("back")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Gestion des étalons" description="Gérez les étalons de calibration" />
      <div className="space-y-6 p-6">
        <StandardsClient />
      </div>
    </>
  );
}

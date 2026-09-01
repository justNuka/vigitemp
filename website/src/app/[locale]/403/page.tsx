"use client";

import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorPageLayout } from "@/components/error/error-page-layout";
import { useRouter } from "@/i18n/navigation";

export default function ForbiddenPage() {
  const t = useTranslations("errors");
  const common = useTranslations("common");
  const router = useRouter();

  return (
    <ErrorPageLayout
      code="403"
      badge={t("forbidden_badge")}
      icon={<ShieldAlert className="h-6 w-6" />}
      title={t("forbidden_title")}
      description={t("forbidden_description")}
      helperText={t("forbidden_helper")}
      primaryAction={{
        label: t("back_home"),
        icon: <Home className="h-4 w-4" />,
      }}
      secondaryAction={{
        label: common("back"),
        icon: <ArrowLeft className="h-4 w-4" />,
        variant: "outline",
        onClick: () => router.back(),
      }}
    />
  );
}
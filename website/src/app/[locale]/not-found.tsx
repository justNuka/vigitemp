'use client';

import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorPageLayout } from "@/components/error/error-page-layout";
import { useRouter } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("errors");
  const common = useTranslations("common");
  const router = useRouter();

  return (
    <ErrorPageLayout
      code="404"
      badge={t("not_found_badge")}
      icon={<AlertCircle className="h-6 w-6" />}
      title={t("not_found_title")}
      description={t("not_found_description")}
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

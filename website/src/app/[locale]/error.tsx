"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, Home, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorPageLayout } from "@/components/error/error-page-layout";
import { useRouter } from "@/i18n/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const common = useTranslations("common");
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPageLayout
      code="500"
      badge={t("server_error_badge")}
      icon={<AlertTriangle className="h-6 w-6" />}
      title={t("server_error_title")}
      description={t("server_error_description")}
      helperText={t("server_error_helper")}
      primaryAction={{
        label: t("retry"),
        icon: <RotateCcw className="h-4 w-4" />,
        onClick: reset,
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
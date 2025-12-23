"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { LoginForm } from "./login-form";

export function LoginShell() {
  const t = useTranslations("common");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}


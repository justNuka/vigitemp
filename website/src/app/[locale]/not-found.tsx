'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AlertCircle, Home } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const pathname = usePathname();
  const t = useTranslations("errors");
  
  // Extraire la locale du pathname actuel (/fr/invalid-route => /fr)
  const locale = pathname?.split('/')[1] || 'fr';
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Logo size="lg" showText={false} />
          <div className="flex items-center gap-3">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-6xl font-bold tracking-tight">404</h1>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t("not_found_title")}</h2>
          <p className="text-muted-foreground">
            {t("not_found_description")}
          </p>
        </div>

        <Link href={`/${locale}`}>
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            {t("back_home")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

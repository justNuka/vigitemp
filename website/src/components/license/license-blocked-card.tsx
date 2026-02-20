"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type LicenseBlockedCardProps = {
  message: string;
  backHref?: string;
  backLabel?: string;
};

export function LicenseBlockedCard({
  message,
  backHref = "/admin",
  backLabel = "Retour",
}: LicenseBlockedCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild variant="outline">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

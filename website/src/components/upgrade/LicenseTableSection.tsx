"use client";

import { getLicenseFeatures, getVisibleLicenseColumns } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { ShineBorder } from "@/components/ui/shine-border";
import { Card, CardHeader } from "@/components/ui/card";
import { Check, X, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import type { LicenseEdition } from "@/lib/license-access";

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

const COLUMN_WIDTH: Record<LicenseEdition, string> = {
  pack: "w-[17%]",
  one: "w-[17%]",
  standard: "w-[17%]",
  expert: "w-[17%]",
};

function getEditionLabel(t: ReturnType<typeof useTranslations>, edition: LicenseEdition): string {
  return t(`upgrade.licenses.table.${edition}` as const);
}

function isRecommendedColumn(edition: LicenseEdition): boolean {
  return edition === "standard";
}

export function LicenseTableSection({ edition }: { edition: LicenseEdition }) {
  const theme = useTheme();
  const t = useTranslations();
  const licenseFeatures = getLicenseFeatures(t);
  const visibleColumns = getVisibleLicenseColumns(edition);
  const showStandardHighlight = edition === "pack" || edition === "one";
  
  return (
    <section id="licences" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              {t("upgrade.licenses.eyebrow")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {t("upgrade.licenses.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("upgrade.licenses.subtitle")}
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={200}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4 w-[32%]">
                    {t("upgrade.licenses.table.feature")}
                  </th>
                  {visibleColumns.map((column) => (
                    <th
                      key={column}
                      className={`text-center p-4 ${COLUMN_WIDTH[column]} ${isRecommendedColumn(column) ? "relative" : "text-xs font-medium text-muted-foreground"}`}
                    >
                      {isRecommendedColumn(column) ? (
                        <div className="relative inline-flex flex-col items-center">
                          <span className="text-xs font-bold text-primary">{getEditionLabel(t, column)}</span>
                          <span className="text-[10px] mt-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {t("upgrade.licenses.table.recommended")}
                          </span>
                        </div>
                      ) : column === "expert" ? (
                        <span className="flex items-center justify-center gap-1">
                          {getEditionLabel(t, column)}
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        </span>
                      ) : (
                        getEditionLabel(t, column)
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {licenseFeatures.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={`border-t border-border/30 transition-colors hover:bg-secondary/20 ${i % 2 === 0 ? "bg-transparent" : "bg-secondary/5"}`}
                  >
                    <td className="text-sm text-foreground p-4">{feature.name}</td>
                    {visibleColumns.map((column) => (
                      <td key={`${feature.name}-${column}`} className="text-center p-4">
                        <CellValue value={feature[column]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showStandardHighlight ? (
            <Card className="relative overflow-hidden glass border-0 shadow-none mt-6 text-center">
              <ShineBorder shineColor={theme.theme === "dark" ? "white" : "black"} />
              <CardHeader className="p-4">
                <p className="text-sm text-foreground">
                  {t("upgrade.licenses.highlight.prefix")} 
                  <span className="text-primary font-bold">Standard</span>
                  {t("upgrade.licenses.highlight.suffix")}
                </p>
              </CardHeader>
            </Card>
          ) : null}
        </BlurFade>
      </div>
    </section>
  );
}

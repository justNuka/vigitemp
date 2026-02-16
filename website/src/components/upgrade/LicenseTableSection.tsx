"use client";

import { getLicenseFeatures } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { ShineBorder } from "@/components/ui/shine-border";
import { Card, CardHeader } from "@/components/ui/card";
import { Check, X, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

export function LicenseTableSection() {
  const theme = useTheme();
  const t = useTranslations();
  const licenseFeatures = getLicenseFeatures(t);
  
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
                  <th className="text-center text-xs font-medium text-muted-foreground p-4 w-[17%]">
                    {t("upgrade.licenses.table.pack")}
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-4 w-[17%]">
                    {t("upgrade.licenses.table.one")}
                  </th>
                  <th className="text-center p-4 w-[17%] relative">
                    <div className="relative inline-flex flex-col items-center">
                      <span className="text-xs font-bold text-primary">
                        {t("upgrade.licenses.table.standard")}
                      </span>
                      <span className="text-[10px] mt-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {t("upgrade.licenses.table.recommended")}
                      </span>
                    </div>
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-4 w-[17%]">
                    <span className="flex items-center justify-center gap-1">
                      {t("upgrade.licenses.table.expert")}
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {licenseFeatures.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={`border-t border-border/30 transition-colors hover:bg-secondary/20 ${i % 2 === 0 ? "bg-transparent" : "bg-secondary/5"}`}
                  >
                    <td className="text-sm text-foreground p-4">{feature.name}</td>
                    <td className="text-center p-4">
                      <CellValue value={feature.pack} />
                    </td>
                    <td className="text-center p-4">
                      <CellValue value={feature.one} />
                    </td>
                    <td className="text-center p-4 relative">
                      <div className="relative">
                        <CellValue value={feature.standard} />
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <CellValue value={feature.expert} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Standard highlight border */}
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
        </BlurFade>
      </div>
    </section>
  );
}

"use client";

import React from "react";

import { getCompareItemsForEdition } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { Compare } from "@/components/ui/compare";
import { Check, X as XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LicenseEdition } from "@/lib/license-access";

function CompareSlider({
  item,
  images,
}: {
  item: ReturnType<typeof getCompareItemsForEdition>[number];
  images: { first: string; second: string };
}) {
  const isMissing = (value: string) => /^(pas|aucun|aucune|non)\b/i.test(value.trim());

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-6 pb-0">
        <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
      </div>

      <div className="w-full h-[50vh] px-2 md:px-8 flex items-center justify-center perspective-distant transform-3d">
        <div
          style={{
            transform: "rotateX(15deg) translateZ(80px)",
          }}
          className="p-1 md:p-4 border rounded-3xl bg-card border-border mx-auto w-full h-2/3"
        >
          <Compare
            firstImage={images.first}
            secondImage={images.second}
            firstImageClassName="object-cover object-left-top w-full"
            secondImageClassname="object-cover object-left-top w-full"
            className="w-full h-full rounded-[22px] md:rounded-lg"
            slideMode="drag"
            autoplay
          />
        </div>
      </div>

      <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{item.leftLabel}</div>
          <div className="space-y-2">
            {item.leftItems.map((li) => {
              const missing = isMissing(li);
              return (
                <div key={li} className="flex items-start gap-2 text-sm">
                  {missing ? (
                    <XIcon className="mt-0.5 h-4 w-4 text-destructive/80" />
                  ) : (
                    <Check className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={missing ? "text-muted-foreground" : "text-foreground/80"}>{li}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
            {item.rightLabel}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              {item.rightLabel}
            </span>
          </div>
          <div className="space-y-2">
            {item.rightItems.map((ri) => (
              <div key={ri} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">{ri}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompareSection({ edition }: { edition: LicenseEdition }) {
  const t = useTranslations();
  const compareItems = getCompareItemsForEdition(t, edition);

  if (compareItems.length === 0) {
    return null;
  }

  return (
    <section id="comparaison" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              {t("upgrade.compare.eyebrow")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {t("upgrade.compare.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("upgrade.compare.subtitle")}
            </p>
          </div>
        </BlurFade>

        <div className="flex flex-col gap-8">
          {compareItems.map((item, i) => {
            const images =
              i % 2 === 0
                ? {
                    first: "/images/upgrade_licence/dashboard.png",
                    second: "/images/upgrade_licence/surveillance1.png",
                  }
                : {
                    first: "/images/upgrade_licence/surveillance2.png",
                    second: "/images/upgrade_licence/dashboard.png",
                  };

            return (
              <BlurFade key={item.id} delay={i * 200}>
                <CompareSlider item={item} images={images} />
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}

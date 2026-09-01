"use client";

import { getStandardBlocks } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { SparklesText } from "@/components/ui/sparkles-text";
import { AuroraText } from "@/components/ui/aurora-text";
import { MagicCard } from "@/components/ui/magic-card";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function StandardDeepDiveSection() {
  const t = useTranslations();
  const standardBlocks = getStandardBlocks(t);

  return (
    <section id="standard" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              {t("upgrade.standard.eyebrow")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              <AuroraText colors={["hsl(var(--primary))", "hsl(var(--accent))"]}>
                <SparklesText 
                  className="inline-flex text-inherit"
                  sparklesCount={3}
                >
                  {t("upgrade.standard.titleHighlight")}
                </SparklesText>
              </AuroraText>
              {t("upgrade.standard.titleSuffix")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("upgrade.standard.subtitle")}
            </p>
          </div>
        </BlurFade>

        <div className="flex flex-col gap-12">
          {standardBlocks.map((block, i) => (
            <BlurFade key={block.title} delay={i * 150} direction={i % 2 === 0 ? "left" : "right"}>
              <div className={`flex flex-col md:flex-row gap-6 items-start ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {block.title}
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {block.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual mock */}
                <div className="flex-1 w-full">
                  <Card className="glass border-0 shadow-none p-0 overflow-hidden">
                    <MagicCard className="p-6 aspect-16/10">
                      <div className="w-full h-full rounded-lg bg-secondary/30 flex flex-col items-center justify-center gap-3">
                        <div className="w-3/4 h-2 rounded-full bg-primary/20" />
                        <div className="w-2/3 h-2 rounded-full bg-primary/10" />
                        <div className="w-1/2 h-2 rounded-full bg-primary/5" />
                        <p className="text-[10px] text-muted-foreground/50 mt-2">
                          {t("upgrade.standard.preview", { title: block.title })}
                        </p>
                      </div>
                    </MagicCard>
                  </Card>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

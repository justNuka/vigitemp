"use client";

import { getValueProps } from "./upgradeContent";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { Card, CardHeader } from "@/components/ui/card";
import { BlurFade } from "./BlurFade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function ValuePropsSection() {
  const theme = useTheme();
  const t = useTranslations();
  const valueProps = getValueProps(t);
  const [isTypewriterDone, setIsTypewriterDone] = useState(false);
  
  return (
    <section id="pourquoi" className="relative py-24 px-4">
      <DotPattern className="opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              {t("upgrade.valueProps.eyebrow")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              <span className="block">
                {t("upgrade.valueProps.titleLine1")}{" "}
                <span className="text-primary">{t("upgrade.valueProps.titleHighlight")}</span>
              </span>
              <span className="mt-2 inline-flex flex-wrap items-center justify-center gap-3">
                <TypewriterEffect
                  words={[{ text: t("upgrade.valueProps.typewriter") }]}
                  className="inline-flex items-center justify-center text-3xl md:text-4xl lg:text-4xl font-bold text-foreground"
                  cursorClassName="bg-primary h-5 md:h-7 lg:h-8"
                  onComplete={() => setIsTypewriterDone(true)}
                  hideCursorOnComplete={false}
                />
                {isTypewriterDone && (
                  <LayoutTextFlip
                    text=""
                    words={[
                      t("upgrade.valueProps.flip.0"),
                      t("upgrade.valueProps.flip.1"),
                      t("upgrade.valueProps.flip.2"),
                    ]}
                  />
                )}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("upgrade.valueProps.subtitle")}
            </p>
          </div>
        </BlurFade>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valueProps.map((prop, i) => {
            const Icon = prop.icon;
            const isStarCard = i === 0 || i === 5;
            return (
              <BlurFade key={prop.title} delay={i * 100}>
                {isStarCard ? (
                  <Card className="relative h-full overflow-hidden glass border-0 shadow-none">
                    <ShineBorder shineColor={theme.theme === "dark" ? "white" : "black"} />
                    <CardHeader className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              {prop.title}
                            </h3>
                            {prop.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {prop.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {prop.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ) : (
                  <Card className="glass border-0 shadow-none p-0 h-full">
                    <MagicCard className="p-6 h-full">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              {prop.title}
                            </h3>
                            {prop.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {prop.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {prop.description}
                          </p>
                        </div>
                      </div>
                    </MagicCard>
                  </Card>
                )}
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}

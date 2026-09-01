"use client";

import { getExpertCards } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { AuroraText } from "@/components/ui/aurora-text";
import { SparklesText } from "@/components/ui/sparkles-text";
import { MagicCard } from "@/components/ui/magic-card";
import { Card } from "@/components/ui/card";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { Sparkles, Bot, BarChart3, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [Sparkles, Bot, BarChart3, Wrench];

export function ExpertTeaserSection() {
  const t = useTranslations();
  const expertCards = getExpertCards(t);

  return (
    <section id="expert" className="relative py-24 px-4 overflow-hidden">
      {/* Aurora background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 left-0 w-full h-full opacity-10 animate-aurora"
          style={{
            background: "linear-gradient(120deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--accent) / 0.15) 25%, hsl(var(--primary) / 0.1) 50%, hsl(var(--primary) / 0.2) 100%)",
            backgroundSize: "300% 300%",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              {t("upgrade.expert.badge")}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              <AuroraText colors={["hsl(var(--primary))", "hsl(var(--accent))"]}>
                <SparklesText 
                  className="inline-flex text-inherit"
                  sparklesCount={3}
                >
                  {t("upgrade.expert.titleHighlight")}
                </SparklesText>
              </AuroraText>
              {t("upgrade.expert.titleSuffix")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("upgrade.expert.subtitle")}
            </p>
          </div>
        </BlurFade>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {expertCards.map((card, i) => {
            const Icon = icons[i];
            return (
              <BlurFade key={card.title} delay={i * 150}>
                <Card className="border-none shadow-none p-0 h-full">
                  <MagicCard className="p-6 h-full" gradientColor="hsl(var(--accent) / 0.08)">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">{card.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                      </div>
                    </div>
                  </MagicCard>
                </Card>
              </BlurFade>
            );
          })}
        </div>

        <BlurFade delay={600}>
          <div className="text-center">
            <TypewriterEffect
              words={[{ text: t("upgrade.expert.typewriter") }]}
              className="inline-flex items-center justify-center text-2xl md:text-3xl font-bold text-accent"
              cursorClassName="bg-accent h-5 md:h-7"
            />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

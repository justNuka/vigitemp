"use client";

import { expertCards } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { AuroraText } from "./AuroraText";
import { MagicCard } from "./MagicCard";
import { TypingAnimation } from "./TypingAnimation";
import { Sparkles, Bot, BarChart3, Wrench } from "lucide-react";

const icons = [Sparkles, Bot, BarChart3, Wrench];

export function ExpertTeaserSection() {
  return (
    <section id="expert" className="relative py-24 px-4 overflow-hidden">
      {/* Aurora background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 left-0 w-full h-full opacity-10 animate-aurora"
          style={{
            background: "linear-gradient(120deg, hsla(190,95%,45%,0.2) 0%, hsla(185,80%,40%,0.15) 25%, hsla(210,60%,50%,0.1) 50%, hsla(190,95%,45%,0.2) 100%)",
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
              Bientot disponible
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              <AuroraText>Expert</AuroraText>
              {" : la plateforme intelligente"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {"Toutes les fonctionnalites Standard + personnalisation + IA + ecosysteme MC2."}
            </p>
          </div>
        </BlurFade>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {expertCards.map((card, i) => {
            const Icon = icons[i];
            return (
              <BlurFade key={card.title} delay={i * 150}>
                <MagicCard className="p-6 h-full" gradientColor="hsla(185, 80%, 40%, 0.08)">
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
              </BlurFade>
            );
          })}
        </div>

        <BlurFade delay={600}>
          <div className="text-center">
            <TypingAnimation
              text="Anticiper. Expliquer. Guider."
              className="text-2xl md:text-3xl font-bold text-accent"
              speed={80}
            />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

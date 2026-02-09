"use client";

import { valueProps } from "./upgradeContent";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { Card, CardHeader } from "@/components/ui/card";
import { BlurFade } from "./BlurFade";
import { DotPattern } from "@/components/ui/dot-pattern";

export function ValuePropsSection() {
  return (
    <section id="pourquoi" className="relative py-24 px-4">
      <DotPattern className="opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              Pourquoi upgrader
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {"Passez d'une surveillance "}
              <span className="text-primary">{'"constat"'}</span>
              {" a une metrologie "}
              <span className="text-primary">{'"maitrisee"'}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {"Six raisons de faire le pas vers Standard."}
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
                    <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
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

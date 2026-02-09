"use client";

import { useRef } from "react";
import { heroContent, proofStats } from "./upgradeContent";
import { AuroraText } from "@/components/ui/aurora-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { BlurFade } from "./BlurFade";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { Card, CardHeader } from "@/components/ui/card";
import { useParallax } from "./useParallax";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useParallax();

  return (
    <section id="intro" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div
          className="absolute -top-40 -left-40 w-150 h-150 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsla(190, 95%, 45%, 0.3) 0%, transparent 70%)",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-125 h-125 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, hsla(185, 80%, 40%, 0.3) 0%, transparent 70%)",
            transform: `translateY(${scrollY * -0.05}px)`,
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(hsla(190,95%,45%,0.3) 1px, transparent 1px), linear-gradient(90deg, hsla(190,95%,45%,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: `translateY(${scrollY * 0.05}px)`,
          }}
        />
      </div>

      {/* Hero content */}
      <div ref={containerRef} className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <BlurFade delay={100}>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Upgrade de licence
          </p>
        </BlurFade>

        <BlurFade delay={200}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-4 text-balance">
            <span className="font-light">Vigi</span>
            <AuroraText
              className="font-extrabold"
              colors={["#a142fe","#40a1ff"]}
            >
              Sensys
            </AuroraText>
          </h1>
        </BlurFade>

        <BlurFade delay={350}>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-foreground/90 mb-2 text-balance leading-relaxed">
            {"Passez a une "}
            <AuroraText 
              className="font-semibold"
              colors={["#40a1ff","#a142fe"]}
            >
              {heroContent.titleHighlight}
            </AuroraText>
          </p>
        </BlurFade>

        <BlurFade delay={500}>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-3 leading-relaxed">
            {heroContent.subtitle}
          </p>
        </BlurFade>

        <BlurFade delay={600}>
          <p className="text-sm text-muted-foreground mb-10">
            {heroContent.subtitleHighlights.map((word, i) => (
              <span key={word}>
                {i > 0 && " / "}
                <span className="text-primary font-medium">{word}</span>
              </span>
            ))}
          </p>
        </BlurFade>

        <BlurFade delay={700}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <RainbowButton size="lg" asChild>
              <a href="#standard">{heroContent.ctaPrimary}</a>
            </RainbowButton>
            <RainbowButton size="lg" variant="outline" asChild>
              <a href="#licences">{heroContent.ctaSecondary}</a>
            </RainbowButton>
          </div>
        </BlurFade>

        {/* Proof stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {proofStats.map((stat, i) => (
            <BlurFade key={stat.title} delay={800 + i * 100}>
              {stat.highlight ? (
                <Card className="relative h-full overflow-hidden glass border-0 shadow-none">
                  <ShineBorder
                    shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                    duration={20}
                    borderWidth={1}
                  />
                  <CardHeader className="p-5 text-center">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardHeader>
                </Card>
              ) : (
                <Card className="border-0 shadow-none p-0 h-full bg-transparent">
                  <MagicCard className="glass overflow-hidden rounded-xl p-5 text-center h-full">
                    <p className="text-sm font-semibold text-foreground mb-1">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </MagicCard>
                </Card>
              )}
            </BlurFade>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <BlurFade delay={1200} className="absolute bottom-8">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-linear-to-b from-primary/50 to-transparent animate-pulse-glow" />
        </div>
      </BlurFade>
    </section>
  );
}

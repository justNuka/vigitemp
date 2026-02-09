"use client";

import React, { forwardRef } from "react"

import { useRef } from "react";
import { architectureNodes, architectureLeft, architectureRight } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { TypingAnimation } from "./TypingAnimation";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-10 flex size-12 items-center justify-center rounded-full border border-border bg-background p-3",
      "shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
      className
    )}
  >
    {children}
  </div>
));

Circle.displayName = "Circle";

export function ArchitectureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sondesRef = useRef<HTMLDivElement>(null);
  const serveurRef = useRef<HTMLDivElement>(null);
  const bddRef = useRef<HTMLDivElement>(null);
  const webappRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<HTMLDivElement>(null);

  return (
    <section id="architecture" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              Architecture
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {"Ecosysteme 100% on-premise"}
            </h2>
          </div>
        </BlurFade>

        {/* Beam diagram */}
        <BlurFade delay={200}>
          <div ref={containerRef} className="relative glass rounded-2xl p-8 mb-12 min-h-50">
            <div className="flex items-center justify-between gap-6 flex-wrap relative z-10">
              {architectureNodes.map((node) => {
                const Icon = node.icon;
                const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
                  sondes: sondesRef,
                  serveur: serveurRef,
                  bdd: bddRef,
                  webapp: webappRef,
                  agent: agentRef,
                };
                return (
                  <div
                    key={node.id}
                    className="flex flex-col items-center gap-2 z-10"
                  >
                    <Circle ref={refMap[node.id]}>
                      <Icon className="w-6 h-6 text-primary" />
                    </Circle>
                    <span className="text-xs font-semibold text-foreground text-center">{node.label}</span>
                    <span className="text-[10px] text-muted-foreground text-center">{node.sublabel}</span>
                  </div>
                );
              })}
            </div>

            {/* Animated beams */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={sondesRef}
              toRef={serveurRef}
              duration={6}
              startYOffset={10}
              endYOffset={10}
              curvature={-20}
              pathColor="hsla(190, 95%, 45%, 0.2)"
              gradientStartColor="#40a1ff"
              gradientStopColor="#0b6bff"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={serveurRef}
              toRef={sondesRef}
              duration={6}
              startYOffset={-10}
              endYOffset={-10}
              curvature={20}
              reverse
              pathColor="hsla(190, 95%, 45%, 0.2)"
              gradientStartColor="#40a1ff"
              gradientStopColor="#0b6bff"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={serveurRef}
              toRef={bddRef}
              duration={5.6}
              curvature={0}
              pathColor="hsla(190, 95%, 45%, 0.2)"
              gradientStartColor="#40a1ff"
              gradientStopColor="#0b6bff"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={bddRef}
              toRef={webappRef}
              duration={6.2}
              startYOffset={10}
              endYOffset={10}
              curvature={-20}
              pathColor="hsla(190, 95%, 45%, 0.2)"
              gradientStartColor="#40a1ff"
              gradientStopColor="#0b6bff"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={webappRef}
              toRef={bddRef}
              duration={6.2}
              startYOffset={-10}
              endYOffset={-10}
              curvature={20}
              reverse
              pathColor="hsla(190, 95%, 45%, 0.2)"
              gradientStartColor="#40a1ff"
              gradientStopColor="#0b6bff"
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={webappRef}
              toRef={agentRef}
              duration={5.4}
              curvature={0}
              pathColor="hsla(190, 95%, 45%, 0.2)"
              gradientStartColor="#40a1ff"
              gradientStopColor="#0b6bff"
            />
          </div>
        </BlurFade>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8">
          <BlurFade delay={300}>
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">{architectureLeft.title}</h3>
              <ul className="flex flex-col gap-3">
                {architectureLeft.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>

          <BlurFade delay={400}>
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">{architectureRight.title}</h3>
              <ul className="flex flex-col gap-3">
                {architectureRight.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>
        </div>

        {/* Typing animation */}
        <BlurFade delay={500}>
          <div className="mt-8 text-center">
            <TypingAnimation
              text="Vos mesures restent chez vous. Toujours."
              className="text-lg text-primary"
              speed={60}
            />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

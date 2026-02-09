"use client";

import React from "react"

import { useRef, useEffect, useState } from "react";
import { architectureNodes, architectureLeft, architectureRight } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { TypingAnimation } from "./TypingAnimation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

function AnimatedBeamLine({ fromRef, toRef, containerRef, delay = 0 }: {
  fromRef: React.RefObject<HTMLDivElement | null>;
  toRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  delay?: number;
}) {
  const [line, setLine] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  useEffect(() => {
    function update() {
      if (!fromRef.current || !toRef.current || !containerRef.current) return;
      const container = containerRef.current.getBoundingClientRect();
      const from = fromRef.current.getBoundingClientRect();
      const to = toRef.current.getBoundingClientRect();
      setLine({
        x1: from.left + from.width / 2 - container.left,
        y1: from.top + from.height / 2 - container.top,
        x2: to.left + to.width / 2 - container.left,
        y2: to.top + to.height / 2 - container.top,
      });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [fromRef, toRef, containerRef]);

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
      <line
        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
        stroke="hsla(190, 95%, 45%, 0.15)"
        strokeWidth="2"
        strokeDasharray="6 4"
      />
      <circle r="4" fill="hsl(190, 95%, 45%)" opacity="0.8">
        <animateMotion
          dur="2.5s"
          repeatCount="indefinite"
          begin={`${delay}s`}
          path={`M${line.x1},${line.y1} L${line.x2},${line.y2}`}
        />
      </circle>
    </svg>
  );
}

export function ArchitectureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(React.RefObject<HTMLDivElement | null>)[]>(
    architectureNodes.map(() => ({ current: null }))
  );

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
            <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
              {architectureNodes.map((node, i) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.id}
                    ref={(el) => { nodeRefs.current[i] = { current: el }; }}
                    className="flex flex-col items-center gap-2 z-10"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-cyan">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground text-center">{node.label}</span>
                    <span className="text-[10px] text-muted-foreground text-center">{node.sublabel}</span>
                  </div>
                );
              })}
            </div>

            {/* Animated beam lines */}
            {architectureNodes.slice(0, -1).map((_, i) => (
              <AnimatedBeamLine
                key={`beam-${architectureNodes[i].id}`}
                fromRef={nodeRefs.current[i]}
                toRef={nodeRefs.current[i + 1]}
                containerRef={containerRef}
                delay={i * 0.5}
              />
            ))}
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

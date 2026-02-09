"use client";

import React from "react"

import { useState, useRef, useCallback } from "react";
import { compareItems } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { cn } from "@/lib/utils";
import { ChevronRight, Check, X as XIcon } from "lucide-react";

function CompareSlider({
  item,
}: {
  item: (typeof compareItems)[0];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
        <div className="flex items-center gap-3 mb-4">
          {item.gains.map((gain) => (
            <span key={gain} className="flex items-center gap-1 text-xs text-primary">
              <Check className="w-3 h-3" />
              {gain}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-64 cursor-col-resize select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        role="slider"
        aria-label={`Comparer ${item.leftLabel} et ${item.rightLabel}`}
        aria-valuenow={Math.round(sliderPosition)}
        tabIndex={0}
      >
        {/* Left side */}
        <div
          className="absolute inset-0 bg-secondary/30 flex flex-col justify-center px-8"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <span className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            {item.leftLabel}
          </span>
          {item.leftItems.map((li) => (
            <div key={li} className="flex items-center gap-2 mb-2">
              <XIcon className="w-3.5 h-3.5 text-destructive/60" />
              <span className="text-sm text-muted-foreground">{li}</span>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div
          className="absolute inset-0 bg-primary/5 flex flex-col justify-center px-8"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <span className="text-xs uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
            {item.rightLabel}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary animate-pulse-glow">
              Standard
            </span>
          </span>
          {item.rightItems.map((ri) => (
            <div key={ri} className="flex items-center gap-2 mb-2">
              <Check className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm text-foreground font-medium">{ri}</span>
            </div>
          ))}
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <ChevronRight className="w-4 h-4 text-primary-foreground -mr-0.5" />
            <ChevronRight className="w-4 h-4 text-primary-foreground -ml-2.5 rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompareSection() {
  return (
    <section id="comparaison" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              Comparaison
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {"Faites glisser pour comparer"}
            </h2>
            <p className="text-muted-foreground">
              {"Voyez la difference entre One et Standard."}
            </p>
          </div>
        </BlurFade>

        <div className="flex flex-col gap-8">
          {compareItems.map((item, i) => (
            <BlurFade key={item.id} delay={i * 200}>
              <CompareSlider item={item} />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Sparkle {
  id: number;
  x: string;
  y: string;
  size: number;
  delay: number;
}

interface SparklesTextProps {
  children: string;
  className?: string;
}

function deterministicFraction(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function SparklesText({ children, className }: SparklesTextProps) {
  const sparkles = useMemo<Sparkle[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: `${deterministicFraction((i + 1) * 7) * 100}%`,
        y: `${deterministicFraction((i + 1) * 11) * 100}%`,
        size: deterministicFraction((i + 1) * 13) * 4 + 2,
        delay: deterministicFraction((i + 1) * 17) * 2,
      })),
    [],
  );

  return (
    <span className={cn("relative inline-block", className)}>
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute animate-sparkle pointer-events-none"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "hsl(190, 95%, 65%)",
            boxShadow: "0 0 6px hsl(190, 95%, 45%)",
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </span>
  );
}

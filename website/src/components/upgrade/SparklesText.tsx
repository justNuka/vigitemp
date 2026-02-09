"use client";

import { useEffect, useState } from "react";
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

export function SparklesText({ children, className }: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generated: Sparkle[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2,
    }));
    setSparkles(generated);
  }, []);

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

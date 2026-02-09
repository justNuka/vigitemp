"use client";

import React from "react"

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 8,
  borderWidth = 1.5,
  colorFrom = "hsl(190, 95%, 45%)",
  colorTo = "hsl(185, 80%, 40%)",
}: BorderBeamProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={
        {
          "--size": size,
          "--duration": duration,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          padding: `${borderWidth}px`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      >
        <div
          className="absolute animate-border-beam"
          style={{
            offsetPath: `rect(0 auto auto 0 round ${borderWidth * 8}px)`,
            background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
            width: `${size}px`,
            aspectRatio: "1",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}

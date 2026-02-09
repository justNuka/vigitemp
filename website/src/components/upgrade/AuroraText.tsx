"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AuroraTextProps {
  children: ReactNode;
  className?: string;
}

export function AuroraText({ children, className }: AuroraTextProps) {
  return (
    <span
      className={cn(
        "bg-linear-to-r from-primary via-accent to-primary bg-size-[200%_auto] bg-clip-text text-transparent animate-aurora",
        className
      )}
    >
      {children}
    </span>
  );
}

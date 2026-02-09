"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface RainbowButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline";
  onClick?: () => void;
  href?: string;
}

export function RainbowButton({
  children,
  className,
  variant = "solid",
  onClick,
  href,
}: RainbowButtonProps) {
  const baseClasses = cn(
    "relative inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-sm",
    "transition-all duration-300 overflow-hidden group cursor-pointer",
    variant === "solid"
      ? "bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground hover:shadow-[0_0_30px_hsla(190,95%,45%,0.4)]"
      : "bg-transparent text-foreground border border-border hover:border-primary/50 hover:text-primary",
    className
  );

  const inner = (
    <>
      {variant === "solid" && (
        <span className="absolute inset-0 bg-linear-to-r from-primary via-accent to-primary bg-size-[200%_100%] animate-aurora opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={baseClasses} onClick={onClick}>
      {inner}
    </button>
  );
}

import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md" }: LogoProps) {
  const heights = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/Logo-Vigitemp-bleu-fonce-1024x292.webp"
        alt="Vigitemp Logo"
        height={heights[size]}
        width={heights[size] * 3.5}
        className="object-contain dark:brightness-0 dark:invert"
        priority
        unoptimized
      />
    </div>
  );
}

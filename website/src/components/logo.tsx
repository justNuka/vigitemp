import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "xs" }: LogoProps) {
  const heights = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 40,
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logos/vigisensys-logo-without-bg2.png"
        alt="VigiSensys Logo"
        height={heights[size] * 3.5}
        width={heights[size] * 3.5}
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  );
}

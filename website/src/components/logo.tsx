import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md" }: LogoProps) {
  const heights = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 40,
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/vigisensys-logo-without-bg2.png"
        alt="VigiSensys Logo"
        height={heights[size]}
        width={heights[size] * 3.5}
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  );
}

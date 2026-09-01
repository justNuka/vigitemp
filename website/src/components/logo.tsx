import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
  textClassName?: string;
  iconClassName?: string;
}

export function Logo({ className, size = "xs", showText = false, textClassName, iconClassName }: LogoProps) {
  const heights = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 40,
  };

  const iconSize = heights[size] * 3.5;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logos/Icone-VigiSensys.png"
        alt="VigiSensys Logo"
        height={iconSize}
        width={iconSize}
        className={cn("object-contain", iconClassName)}
        priority
        unoptimized
      />
      {showText && (
        <span className={cn("text-xl font-normal font-montserrat", textClassName)}>
          <span>Vigi</span>
          <span className="font-bold">Sensys</span>
        </span>
      )}
    </div>
  );
}

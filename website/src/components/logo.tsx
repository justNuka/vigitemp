import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizes[size], "w-auto")}
        aria-label="Vigitemp Logo"
      >
        <rect
          x="4"
          y="8"
          width="32"
          height="24"
          rx="4"
          className="stroke-primary"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M10 20 L16 26 L30 14"
          className="stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle
          cx="32"
          cy="12"
          r="4"
          className="fill-warning stroke-warning"
          strokeWidth="1"
        />
      </svg>
      {showText && (
        <span
          className={cn(
            textSizes[size],
            "font-semibold tracking-tight text-foreground"
          )}
        >
          <span className="text-primary">V</span>
          <span className="text-muted-foreground">i</span>
          <span className="text-primary">G</span>
          <span className="text-muted-foreground">i</span>
          <span className="text-primary">T</span>
          <span className="text-primary">=</span>
          <span className="text-primary">MP</span>
        </span>
      )}
    </div>
  );
}

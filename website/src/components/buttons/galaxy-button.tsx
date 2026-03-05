"use client";

import * as React from "react";

type GalaxyButtonVariant = "violet" | "cyan" | "pink" | "amber" | "slate";
type GalaxyButtonSize = "sm" | "md" | "lg";
type GalaxyBackdrop = "none" | "local" | "fullscreen";

type Props = {
  label?: string;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  className?: string;
  variant?: GalaxyButtonVariant;
  size?: GalaxyButtonSize;
  disabled?: boolean;

  /** none | local | fullscreen */
  backdrop?: GalaxyBackdrop;

  /** Override direct de la teinte (ex: 280) */
  hue?: number;
};

const RANDOM = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const VARIANT_HUE: Record<GalaxyButtonVariant, number> = {
  violet: 245,
  cyan: 190,
  pink: 320,
  amber: 38,
  slate: 220,
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function GalaxyButton({
  label = "Explore",
  onClick,
  className,
  variant = "violet",
  size = "md",
  disabled,
  backdrop = "local",
  hue,
}: Props) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const stars = root.querySelectorAll<HTMLElement>(".gb-star");
    stars.forEach((s) => {
      s.style.setProperty("--angle", String(RANDOM(0, 360)));
      s.style.setProperty("--duration", String(RANDOM(6, 20)));
      s.style.setProperty("--delay", String(RANDOM(1, 10)));
      s.style.setProperty("--alpha", String(RANDOM(40, 90) / 100));
      s.style.setProperty("--size", String(RANDOM(2, 6)));
      s.style.setProperty("--distance", String(RANDOM(40, 200)));
    });
  }, []);

  const orbitStars = React.useMemo(() => Array.from({ length: 20 }), []);
  const staticStars = React.useMemo(() => Array.from({ length: 4 }), []);

  const sizeClass =
    size === "sm" ? "gb-size-sm" : size === "lg" ? "gb-size-lg" : "gb-size-md";

  const finalHue = typeof hue === "number" ? hue : VARIANT_HUE[variant];

  const isFullscreen = backdrop === "fullscreen";
  const isLocal = backdrop === "local";

  return (
    <div
      ref={rootRef}
      className={cn("gb-root", sizeClass, className)}
      style={
        {
          ["--active" as any]: active && !disabled ? 1 : 0,
          ["--hue" as any]: finalHue,
          ["--transition" as any]: "0.25s",
          ["--spark" as any]: "1.8s",
        } as React.CSSProperties
      }
      onMouseEnter={() => !disabled && setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => !disabled && setActive(true)}
      onBlurCapture={() => setActive(false)}
      data-disabled={disabled ? "true" : "false"}
      data-backdrop={backdrop}
    >
      {/* backdrop local (glow) */}
      {isLocal && <div className="gb-localdrop" aria-hidden="true" />}

      <button
        type="button"
        onClick={onClick}
        className="gb-btn"
        disabled={disabled}
      >
        <span className="gb-spark" />
        <span className="gb-backdrop" />

        <span className="gb-galaxy__container" aria-hidden="true">
          {staticStars.map((_, i) => (
            <span key={i} className="gb-star gb-star--static" />
          ))}
        </span>

        <span className="gb-galaxy" aria-hidden="true">
          <span className="gb-galaxy__ring">
            {orbitStars.map((_, i) => (
              <span key={i} className="gb-star gb-star--orbit" />
            ))}
          </span>
        </span>

        <span className="gb-text">{label}</span>
      </button>

      {/* overlay plein écran (effet original) */}
      {isFullscreen && <div className="gb-bodydrop" aria-hidden="true" />}
    </div>
  );
}
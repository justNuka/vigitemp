"use client";

import * as React from "react";

type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
};

type MoreMenuProps = {
  items: MenuItem[];
  className?: string;

  /** position du menu par rapport au bouton */
  align?: "right" | "left";

  /** couleurs (tu peux brancher sur ton design system) */
  buttonClassName?: string;
  menuClassName?: string;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function MoreMenu({
  items,
  className,
  align = "right",
  buttonClassName,
  menuClassName,
}: MoreMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex items-center", className)}
      data-open={open ? "true" : "false"}
    >
      <button
        type="button"
        aria-label="Menu Button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "mm-more-button",
          "relative z-10 grid place-items-center rounded-full",
          "h-12 w-12",
          "bg-indigo-500 text-white",
          "shadow-[0_0_0_4px_rgba(92,103,255,0.30)]",
          "transition-all duration-200 ease-in",
          "hover:shadow-[0_0_0_8px_rgba(92,103,255,0.30)] hover:bg-indigo-600",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          buttonClassName
        )}
      >
        <div className="mm-menu-icon-wrapper" aria-hidden="true">
          <div className="mm-menu-icon-line half first" />
          <div className="mm-menu-icon-line" />
          <div className="mm-menu-icon-line half last" />
        </div>
      </button>

      <ul
        role="menu"
        className={cn(
          "mm-list",
          "absolute bottom-0",
          align === "right" ? "right-6 origin-bottom-right" : "left-6 origin-bottom-left",
          "w-[140px] rounded-lg bg-white p-1.5",
          "shadow-[0_0_4px_4px_rgba(150,157,249,0.16)]",
          "opacity-0 scale-0 pointer-events-none",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] delay-100",
          menuClassName
        )}
      >
        {items.map((it, idx) => (
          <li
            key={it.key}
            role="menuitem"
            tabIndex={open ? 0 : -1}
            style={{ ["--i" as any]: idx } as React.CSSProperties}
            className={cn(
              "mm-item",
              "relative flex items-center gap-2 rounded-md px-2.5 py-2.5",
              "text-[14px] leading-5",
              it.danger ? "text-red-600 hover:text-red-700" : "text-[#1c3991] hover:text-indigo-500",
              "cursor-pointer select-none",
              "transition-colors duration-200",
              "opacity-0 translate-x-[-10px]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
            )}
            onClick={() => {
              setOpen(false);
              it.onSelect?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(false);
                it.onSelect?.();
              }
            }}
          >
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center">
              {it.icon}
            </span>
            <span>{it.label}</span>

            {/* séparateur */}
            <span className="pointer-events-none absolute left-3 right-3 bottom-0 h-px bg-[rgba(132,160,244,0.10)] last:hidden" />
          </li>
        ))}
      </ul>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getTocItems } from "./upgradeContent";
import { useTranslations } from "next-intl";

export function UpgradeToc({ includeComparison = true }: { includeComparison?: boolean }) {
  const t = useTranslations();
  const tocItems = getTocItems(t).filter((item) => includeComparison || item.id !== "comparaison");
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    for (const item of tocItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [tocItems]);

  return (
    <nav className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-1">
      <div className="glass rounded-xl p-3 glow-cyan">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-2">
          {t("upgrade.toc.title")}
        </p>
        {tocItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200",
              activeId === item.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                activeId === item.id
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30"
              )}
            />
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

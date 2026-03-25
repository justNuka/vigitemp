"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const t = useTranslations("themeToggle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted ? (theme === "system" ? resolvedTheme ?? "system" : theme) : theme;

  const applyThemeChoice = (nextTheme: "light" | "dark" | "system") => {
    setTheme(nextTheme);

    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem("vigitemp-theme", nextTheme);
    } catch {
      // ignore storage write failures
    }

    const root = window.document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = nextTheme === "dark" || (nextTheme === "system" && prefersDark);
    root.classList.toggle("dark", shouldUseDark);
    root.style.colorScheme = shouldUseDark ? "dark" : "light";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          data-testid="button-theme-toggle"
          aria-label={t("aria")}
          className="text-[hsl(var(--sidebar))] hover:text-[hsl(var(--sidebar))] dark:text-white dark:hover:text-white"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("aria")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => applyThemeChoice("light")}
          data-testid="menu-theme-light"
          className={selectedTheme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => applyThemeChoice("dark")}
          data-testid="menu-theme-dark"
          className={selectedTheme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => applyThemeChoice("system")}
          data-testid="menu-theme-system"
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { navLinks } from "./upgradeContent";
import { RainbowButton } from "./RainbowButton";
import { Menu, X } from "lucide-react";

export function UpgradeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-90 transition-all duration-500",
        scrolled
          ? "glass-strong py-2 glow-cyan"
          : "bg-transparent py-4"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#intro" className="flex items-center gap-1 shrink-0">
          <span className="text-lg text-foreground font-light tracking-tight">
            Vigi<span className="font-bold text-primary">Sensys</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
            Votre licence : <span className="text-foreground font-medium">One</span>
          </span>
          <RainbowButton variant="solid" href="#contact" className="text-xs px-5 py-2">
            Demander un devis
          </RainbowButton>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-strong mt-2 mx-4 rounded-xl p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            <RainbowButton variant="solid" href="#contact" className="w-full text-sm">
              Demander un devis
            </RainbowButton>
          </div>
        </div>
      )}
    </header>
  );
}

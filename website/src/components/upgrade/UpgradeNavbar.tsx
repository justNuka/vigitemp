"use client";

import { useState } from "react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { navLinks } from "./upgradeContent";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
} from "@/components/ui/resizable-navbar";

const compactNavItems = [
  { name: "Comparaison", link: "#comparaison" },
  { name: "Licences", link: "#licences" },
  { name: "Contact", link: "#contact" },
];

const fullNavItems = navLinks.map((link) => ({
  name: link.label,
  link: link.href,
}));

function UpgradeNavBody({ visible }: { visible?: boolean }) {
  const items = visible ? compactNavItems : fullNavItems;

  return (
    <NavBody
      visible={visible}
      className={visible ? "bg-white/90 dark:bg-neutral-900/90" : undefined}
    >
      <a href="#intro" className="relative z-20 flex items-center gap-2 px-2 py-1">
        <img
          src="/logos/Icone-VigiSensys.png"
          alt="VigiSensys"
          className="h-6 w-6 object-contain"
        />
        {!visible && (
          <span className="text-lg text-foreground font-light tracking-tight">
            Vigi<span className="font-bold text-primary">Sensys</span>
          </span>
        )}
      </a>

      <NavItems items={items} />

      {!visible && (
        <div className="relative z-20 hidden items-center gap-3 lg:flex">
          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
            Votre licence : <span className="text-foreground font-medium">One</span>
          </span>
          <RainbowButton size="sm" className="px-5" asChild>
            <a href="#contact">Demander un devis</a>
          </RainbowButton>
        </div>
      )}
    </NavBody>
  );
}

function UpgradeMobileNav({
  visible,
  isOpen,
  onToggle,
  onClose,
}: {
  visible?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const items = visible ? compactNavItems : fullNavItems;

  return (
    <MobileNav
      visible={visible}
      className={visible ? "bg-white/90 dark:bg-neutral-900/90" : undefined}
    >
      <MobileNavHeader>
        <a href="#intro" className="flex items-center gap-2 px-2 py-1">
          <img
            src="/logos/vigisensys-logo-without-bg.png"
            alt="VigiSensys"
            className="h-6 w-6 object-contain"
          />
          {!visible && (
            <span className="text-base text-foreground font-light tracking-tight">
              Vigi<span className="font-bold text-primary">Sensys</span>
            </span>
          )}
        </a>
        <MobileNavToggle isOpen={isOpen} onClick={onToggle} />
      </MobileNavHeader>

      <MobileNavMenu isOpen={isOpen} onClose={onClose}>
        {items.map((item) => (
          <a
            key={item.link}
            href={item.link}
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {item.name}
          </a>
        ))}
        {!visible && (
          <RainbowButton className="w-full text-sm" asChild>
            <a href="#contact">Demander un devis</a>
          </RainbowButton>
        )}
      </MobileNavMenu>
    </MobileNav>
  );
}

export function UpgradeNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Navbar className="fixed inset-x-0 top-0 z-90">
      <UpgradeNavBody />
      <UpgradeMobileNav
        isOpen={mobileOpen}
        onToggle={() => setMobileOpen((open) => !open)}
        onClose={() => setMobileOpen(false)}
      />
    </Navbar>
  );
}

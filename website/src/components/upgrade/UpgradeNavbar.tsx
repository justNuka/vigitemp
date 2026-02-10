"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getNavLinks } from "./upgradeContent";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
} from "@/components/ui/resizable-navbar";

function UpgradeNavBody({ visible }: { visible?: boolean }) {
  const t = useTranslations();
  const navLinks = getNavLinks(t);
  const items = visible
    ? [
        { name: t("upgrade.nav.comparaison"), link: "#comparaison" },
        { name: t("upgrade.nav.licences"), link: "#licences" },
        { name: t("upgrade.nav.contact"), link: "#contact" },
      ]
    : navLinks.map((link) => ({ name: link.label, link: link.href }));

  const navClassName = visible
    ? "!bg-white/75 !text-[hsl(var(--sidebar))] dark:!bg-[hsl(var(--sidebar))] dark:!text-white"
    : "!bg-transparent !text-white";
  const navLinkClassName = visible
    ? "text-[hsl(var(--sidebar))] dark:text-white"
    : "text-white/90 hover:text-white";
  const navHoverClassName = visible
    ? "bg-[hsl(var(--sidebar))]/10 dark:bg-white/10"
    : "bg-white/10";

  return (
    <NavBody visible={visible} className={navClassName}>
      <a href="/" className="relative z-20 flex items-center gap-2 px-2 py-1">
        <Image
          src="/logos/Icone-VigiSensys.png"
          alt="VigiSensys"
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
        />
        {!visible && (
          <span className="text-lg text-foreground font-light tracking-tight">
            Vigi<span className="font-bold text-primary">Sensys</span>
          </span>
        )}
      </a>

      <NavItems
        items={items}
        linkClassName={navLinkClassName}
        hoverClassName={navHoverClassName}
      />

      <div className="relative z-20 hidden items-center gap-3 lg:flex">
        {!visible && (
          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
            {t("upgrade.nav.licenseLabel")}{" "}
            <span className="text-foreground font-medium">One</span>
          </span>
        )}
        {!visible && (
          <RainbowButton size="sm" className="px-5" asChild>
            <a href="#intro">{t("upgrade.nav.homeCta")}</a>
          </RainbowButton>
        )}
        <ThemeToggle />
      </div>
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
  const t = useTranslations();
  const navLinks = getNavLinks(t);
  const items = visible
    ? [
        { name: t("upgrade.nav.comparaison"), link: "#comparaison" },
        { name: t("upgrade.nav.licences"), link: "#licences" },
        { name: t("upgrade.nav.contact"), link: "#contact" },
      ]
    : navLinks.map((link) => ({ name: link.label, link: link.href }));

  const mobileNavClassName = visible
    ? "!bg-white/80 !text-[hsl(var(--sidebar))] dark:!bg-[hsl(var(--sidebar))] dark:!text-white"
    : "!bg-transparent !text-white";
  const mobileLinkClassName = visible
    ? "text-sm text-[hsl(var(--sidebar))]/80 hover:text-[hsl(var(--sidebar))] transition-colors dark:text-white/80 dark:hover:text-white"
    : "text-sm text-white/80 hover:text-white transition-colors";

  return (
    <MobileNav visible={visible} className={mobileNavClassName}>
      <MobileNavHeader>
        <a href="/" className="flex items-center gap-2 px-2 py-1">
          <Image
            src="/logos/Icone-VigiSensys.png"
            alt="VigiSensys"
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
          {!visible && (
            <span className="text-base text-foreground font-light tracking-tight">
              Vigi<span className="font-bold text-primary">Sensys</span>
            </span>
          )}
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNavToggle isOpen={isOpen} onClick={onToggle} />
        </div>
      </MobileNavHeader>

      <MobileNavMenu isOpen={isOpen} onClose={onClose}>
        {items.map((item) => (
          <a
            key={item.link}
            href={item.link}
            onClick={onClose}
            className={mobileLinkClassName}
          >
            {item.name}
          </a>
        ))}
        {!visible && (
          <RainbowButton className="w-full text-sm" asChild>
            <a href="#intro">{t("upgrade.nav.homeCta")}</a>
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
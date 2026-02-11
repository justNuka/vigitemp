"use client";

import { useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
} from "@/components/ui/resizable-navbar";

type NavItem = {
  name: string;
  link: string;
};

type NavBadge = {
  label: string;
  value?: string;
};

type NavCta = {
  label: string;
  href: string;
};

interface ServicesNavbarProps {
  items: NavItem[];
  compactItems?: NavItem[];
  badge?: NavBadge;
  cta?: NavCta;
  className?: string;
  topClassName?: string;
  scrolledClassName?: string;
  topLinkClassName?: string;
  scrolledLinkClassName?: string;
  topHoverClassName?: string;
  scrolledHoverClassName?: string;
}

function ServicesNavBody({
  visible,
  items,
  compactItems,
  badge,
  cta,
  topClassName,
  scrolledClassName,
  topLinkClassName,
  scrolledLinkClassName,
  topHoverClassName,
  scrolledHoverClassName,
}: {
  visible?: boolean;
  items: NavItem[];
  compactItems?: NavItem[];
  badge?: NavBadge;
  cta?: NavCta;
  topClassName?: string;
  scrolledClassName?: string;
  topLinkClassName?: string;
  scrolledLinkClassName?: string;
  topHoverClassName?: string;
  scrolledHoverClassName?: string;
}) {
  const displayItems = visible && compactItems?.length ? compactItems : items;
  const navClassName = visible
    ? scrolledClassName ??
      "!bg-white/75 !text-[hsl(var(--sidebar))] dark:!bg-[hsl(var(--sidebar))] dark:!text-white"
    : topClassName ?? "!bg-transparent !text-white";
  const navLinkClassName = visible
    ? scrolledLinkClassName ?? "text-[hsl(var(--sidebar))] dark:text-white"
    : topLinkClassName ?? "text-white/90 hover:text-white";
  const navHoverClassName = visible
    ? scrolledHoverClassName ?? "bg-[hsl(var(--sidebar))]/10 dark:bg-white/10"
    : topHoverClassName ?? "bg-white/10";

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
        items={displayItems}
        linkClassName={navLinkClassName}
        hoverClassName={navHoverClassName}
      />

      <div className="relative z-20 hidden items-center gap-3 lg:flex">
        {!visible && badge && (
          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
            {badge.label}
            {badge.value ? (
              <span className="text-foreground font-medium"> {badge.value}</span>
            ) : null}
          </span>
        )}
        {!visible && cta && (
          <RainbowButton size="sm" className="px-5" asChild>
            <a href={cta.href}>{cta.label}</a>
          </RainbowButton>
        )}
        <ThemeToggle />
      </div>
    </NavBody>
  );
}

function ServicesMobileNav({
  visible,
  isOpen,
  onToggle,
  onClose,
  items,
  compactItems,
  cta,
  topClassName,
  scrolledClassName,
  topLinkClassName,
  scrolledLinkClassName,
}: {
  visible?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  items: NavItem[];
  compactItems?: NavItem[];
  cta?: NavCta;
  topClassName?: string;
  scrolledClassName?: string;
  topLinkClassName?: string;
  scrolledLinkClassName?: string;
}) {
  const displayItems = visible && compactItems?.length ? compactItems : items;
  const mobileNavClassName = visible
    ? scrolledClassName ??
      "!bg-white/80 !text-[hsl(var(--sidebar))] dark:!bg-[hsl(var(--sidebar))] dark:!text-white"
    : topClassName ?? "!bg-transparent !text-white";
  const mobileLinkClassName = visible
    ? scrolledLinkClassName ??
      "text-sm text-[hsl(var(--sidebar))]/80 hover:text-[hsl(var(--sidebar))] transition-colors dark:text-white/80 dark:hover:text-white"
    : topLinkClassName ?? "text-sm text-white/80 hover:text-white transition-colors";

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
        {displayItems.map((item) => (
          <a
            key={item.link}
            href={item.link}
            onClick={onClose}
            className={mobileLinkClassName}
          >
            {item.name}
          </a>
        ))}
        {!visible && cta && (
          <RainbowButton className="w-full text-sm" asChild>
            <a href={cta.href}>{cta.label}</a>
          </RainbowButton>
        )}
      </MobileNavMenu>
    </MobileNav>
  );
}

export function ServicesNavbar({
  items,
  compactItems,
  badge,
  cta,
  className,
  topClassName,
  scrolledClassName,
  topLinkClassName,
  scrolledLinkClassName,
  topHoverClassName,
  scrolledHoverClassName,
}: ServicesNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Navbar className={className ?? "fixed inset-x-0 top-0 z-90"}>
      <ServicesNavBody
        items={items}
        compactItems={compactItems}
        badge={badge}
        cta={cta}
        topClassName={topClassName}
        scrolledClassName={scrolledClassName}
        topLinkClassName={topLinkClassName}
        scrolledLinkClassName={scrolledLinkClassName}
        topHoverClassName={topHoverClassName}
        scrolledHoverClassName={scrolledHoverClassName}
      />
      <ServicesMobileNav
        items={items}
        compactItems={compactItems}
        cta={cta}
        topClassName={topClassName}
        scrolledClassName={scrolledClassName}
        topLinkClassName={topLinkClassName}
        scrolledLinkClassName={scrolledLinkClassName}
        isOpen={mobileOpen}
        onToggle={() => setMobileOpen((open) => !open)}
        onClose={() => setMobileOpen(false)}
      />
    </Navbar>
  );
}

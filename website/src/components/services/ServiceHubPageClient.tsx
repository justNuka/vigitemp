"use client";

import { useTranslations } from "next-intl";
import { AuroraText } from "@/components/ui/aurora-text";
import { SparklesText } from "@/components/ui/sparkles-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ShoppingCart, Megaphone } from "lucide-react";
import { useTheme } from "next-themes";
import { ServicesNavbar } from "@/components/services/ServicesNavbar";
import { Link } from "@/i18n/navigation";

const cardIcons = {
  upgrade: ArrowUpRight,
  hardware: ShoppingCart,
  news: Megaphone,
};

type CardKey = keyof typeof cardIcons;

export function ServiceHubPageClient() {
  const t = useTranslations();
  const theme = useTheme();
  const isDark = theme.theme === "dark";
  const auroraColors = isDark
    ? ["hsl(var(--primary))", "hsl(var(--sidebar))"]
    : ["hsl(var(--primary))", "hsl(198 71% 62%)"];

  const cards: Array<{
    key: CardKey;
    href: string;
    title: string;
    description: string;
    tag: string;
    cta: string;
  }> = [
    {
      key: "upgrade",
      href: "/services/upgrade-licence",
      title: t("servicesHub.cards.upgrade.title"),
      description: t("servicesHub.cards.upgrade.description"),
      tag: t("servicesHub.cards.upgrade.tag"),
      cta: t("servicesHub.cards.upgrade.cta"),
    },
    {
      key: "hardware",
      href: "/services/demande-materiel",
      title: t("servicesHub.cards.hardware.title"),
      description: t("servicesHub.cards.hardware.description"),
      tag: t("servicesHub.cards.hardware.tag"),
      cta: t("servicesHub.cards.hardware.cta"),
    },
    {
      key: "news",
      href: "/services/actualites-mc2",
      title: t("servicesHub.cards.news.title"),
      description: t("servicesHub.cards.news.description"),
      tag: t("servicesHub.cards.news.tag"),
      cta: t("servicesHub.cards.news.cta"),
    },
  ];

  const highlights = [
    t("servicesHub.highlights.items.0"),
    t("servicesHub.highlights.items.1"),
    t("servicesHub.highlights.items.2"),
  ];

  const navItems = [
    { name: t("servicesNav.upgrade"), link: "/services/upgrade-licence" },
    { name: t("servicesNav.hardware"), link: "/services/demande-materiel" },
    { name: t("servicesNav.news"), link: "/services/actualites-mc2" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <ServicesNavbar
        items={navItems}
        topClassName="!bg-transparent !text-[hsl(var(--sidebar))]"
        topLinkClassName="text-[hsl(var(--sidebar))] hover:text-[hsl(var(--sidebar))]"
        topHoverClassName="bg-[hsl(var(--sidebar))]/10"
        scrolledClassName="!bg-white/85 !text-[hsl(var(--sidebar))]"
        scrolledLinkClassName="text-[hsl(var(--sidebar))]"
        scrolledHoverClassName="bg-[hsl(var(--sidebar))]/10"
      />
      <DotPattern className="opacity-35" />

      <main className="relative z-10">
        <section className="px-4 pt-24 pb-14">
          <div className="mx-auto max-w-5xl text-center">
            <BlurFade>
              <p className="text-xs uppercase tracking-[0.35em] text-primary mb-5">
                {t("servicesHub.hero.eyebrow")}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">
                {t("servicesHub.hero.title")}{" "}
                <AuroraText
                  className="font-extrabold"
                  colors={auroraColors}
                >
                  {t("servicesHub.hero.titleHighlight")}
                </AuroraText>
              </h1>
              <SparklesText
                className="text-lg sm:text-xl text-muted-foreground"
                colors={{ first: auroraColors[0], second: auroraColors[1] }}
                sparklesCount={6}
              >
                {t("servicesHub.hero.subtitle")}
              </SparklesText>
            </BlurFade>

          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl">
            <BlurFade>
              <div className="rounded-3xl border border-border/60 bg-white/90 p-8 shadow-sm dark:bg-card/80">
                <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
                  {t("servicesHub.highlights.eyebrow")}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {t("servicesHub.highlights.title")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("servicesHub.highlights.subtitle")}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-foreground border border-border/40 dark:bg-background/70"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
            {cards.map((card, index) => {
              const Icon = cardIcons[card.key];
              const delay = index === 0 ? 0 : index === 1 ? 0.5 : 1;
              return (
                <BlurFade key={card.key} delay={delay} duration={0.45}>
                  <MagicCard
                    className="h-full rounded-2xl p-6 border border-border/60 shadow-sm"
                    surfaceClassName="bg-white/95 dark:bg-card/80"
                    gradientColor="hsl(var(--primary) / 0.12)"
                    gradientFrom="hsl(var(--primary) / 0.35)"
                    gradientTo="hsl(var(--primary) / 0.08)"
                    gradientOpacity={0.5}
                  >
                    <div className="flex h-full flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            {card.title}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {card.tag}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.description}
                      </p>
                      <div className="mt-auto">
                        <Button variant="outline" className="w-full justify-between" asChild>
                          <Link href={card.href}>
                            <span>{card.cta}</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </MagicCard>
                </BlurFade>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Rss, Users, ArrowUpRight } from "lucide-react";
import { ServicesNavbar } from "@/components/services/ServicesNavbar";

const channelIcons = [Globe, Rss, Users];

export function NewsFeedPageClient() {
  const t = useTranslations();
  const navItems = [
    { name: t("servicesNav.upgrade"), link: "/services/upgrade-licence" },
    { name: t("servicesNav.hardware"), link: "/services/achat-materiel" },
    { name: t("servicesNav.news"), link: "/services/actualites-mc2" },
  ];
  const channels = [
    {
      title: t("servicesNews.channels.0.title"),
      description: t("servicesNews.channels.0.description"),
      tag: t("servicesNews.channels.0.tag"),
      iconIndex: 0,
    },
    {
      title: t("servicesNews.channels.1.title"),
      description: t("servicesNews.channels.1.description"),
      tag: t("servicesNews.channels.1.tag"),
      iconIndex: 1,
    },
    {
      title: t("servicesNews.channels.2.title"),
      description: t("servicesNews.channels.2.description"),
      tag: t("servicesNews.channels.2.tag"),
      iconIndex: 2,
    },
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
      <DotPattern className="opacity-30" />

      <main className="relative z-10 px-4 pt-24 pb-24">
        <div className="mx-auto max-w-5xl">
          <BlurFade>
            <p className="text-xs uppercase tracking-[0.35em] text-primary mb-4">
              {t("servicesNews.hero.eyebrow")}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {t("servicesNews.hero.title")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {t("servicesNews.hero.subtitle")}
            </p>
          </BlurFade>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {channels.map((channel, index) => {
              const Icon = channelIcons[channel.iconIndex];
              return (
                <BlurFade key={channel.title} delay={100 + index * 120}>
                  <MagicCard className="h-full rounded-2xl p-6">
                    <div className="flex h-full flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <Badge variant="secondary">{channel.tag}</Badge>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {channel.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {channel.description}
                        </p>
                      </div>
                      <span className="mt-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
                        {t("servicesNews.channels.cta")}
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </MagicCard>
                </BlurFade>
              );
            })}
          </div>

          <BlurFade delay={200}>
            <div className="mt-12 rounded-2xl border border-border/60 bg-card/80 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("servicesNews.note.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("servicesNews.note.subtitle")}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/services/upgrade-licence">
                  {t("servicesNews.note.cta")}
                </Link>
              </Button>
            </div>
          </BlurFade>
        </div>
      </main>
    </div>
  );
}

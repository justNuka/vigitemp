"use client";

import { getContactInfo } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { ShineBorder } from "@/components/ui/shine-border";
import { Card, CardHeader } from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Mail, Phone, Clock, Server } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export function FinalCTASection() {
  const theme = useTheme();
  const t = useTranslations();
  const contactInfo = getContactInfo(t);
  const contactItems = [
    { icon: Mail, label: t("upgrade.contact.labels.email"), value: contactInfo.email },
    { icon: Phone, label: t("upgrade.contact.labels.phone"), value: contactInfo.phone },
    { icon: Clock, label: t("upgrade.contact.labels.response"), value: contactInfo.responseTime },
    { icon: Server, label: t("upgrade.contact.labels.installation"), value: contactInfo.installation },
  ];

  return (
    <section id="contact" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* CTA block */}
        <BlurFade>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {t("upgrade.contact.title")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t("upgrade.contact.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <RainbowButton size="lg">{t("upgrade.contact.ctaPrimary")}</RainbowButton>
              <RainbowButton size="lg" variant="outline">
                {t("upgrade.contact.ctaSecondary")}
              </RainbowButton>
            </div>
          </div>
        </BlurFade>

        {/* Contact card */}
        <BlurFade delay={300}>
          <Card className="relative overflow-hidden glass border-0 shadow-none max-w-lg mx-auto">
            <ShineBorder shineColor={theme.theme === "dark" ? "white" : "black"} />
            <CardHeader className="p-8">
              <div className="grid grid-cols-2 gap-6">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-xs text-foreground font-medium">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardHeader>
          </Card>
        </BlurFade>

        {/* Footer */}
        <BlurFade delay={500}>
          <div className="text-center mt-16 pt-8 border-t border-border/30">
            <p className="text-sm text-foreground mb-1">
              <span className="font-light">Vigi</span>
              <span className="font-bold text-primary">Sensys </span>
              <span className="font-light">{t("upgrade.contact.footer.by")}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {t("upgrade.contact.footer.tagline")}
            </p>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

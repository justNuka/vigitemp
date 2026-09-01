"use client";

import { BlurFade } from "./BlurFade";
import { PinContainer } from "@/components/ui/3d-pin";
import { MapPin, Locate, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function PlansSection() {
  const t = useTranslations();
  const features = [
    { icon: MapPin, text: t("upgrade.plans.features.0") },
    { icon: Locate, text: t("upgrade.plans.features.1") },
    { icon: AlertTriangle, text: t("upgrade.plans.features.2") },
  ];

  return (
    <section id="plans" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              {t("upgrade.plans.eyebrow")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {t("upgrade.plans.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("upgrade.plans.subtitle")}
            </p>
          </div>
        </BlurFade>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Pin 3D */}
          <BlurFade delay={200}>
            <div className="flex items-center justify-center">
              <PinContainer title={t("upgrade.plans.pin.cardTitle")} href="#plans">
                <div className="flex w-[20rem] h-80 flex-col p-4 tracking-tight text-foreground">
                  <h3 className="max-w-xs pb-2! m-0! font-bold text-base text-foreground">
                    {t("upgrade.plans.pin.title")}
                  </h3>
                  <div className="text-base m-0! p-0! font-normal">
                    <span className="text-muted-foreground">
                      {t("upgrade.plans.pin.description")}
                    </span>
                  </div>
                  <div className="flex flex-1 w-full rounded-lg mt-4 overflow-hidden">
                    <Image
                      src="/images/upgrade_licence/dashboard.png"
                      alt={t("upgrade.plans.pin.imageAlt")}
                      width={320}
                      height={320}
                      sizes="(max-width: 1024px) 80vw, 320px"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </PinContainer>
            </div>
          </BlurFade>

          {/* Features */}
          <BlurFade delay={400}>
            <div className="flex flex-col gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed pt-2">{f.text}</p>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground mt-4 pl-14">
                {t("upgrade.plans.note")}
              </p>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

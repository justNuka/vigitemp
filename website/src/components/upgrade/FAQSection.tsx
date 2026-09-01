"use client";

import { useState } from "react";
import { getFaqItems } from "./upgradeContent";
import { BlurFade } from "./BlurFade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { ChevronDown, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslations();
  const faqItems = getFaqItems(t);

  return (
    <section id="securite" className="relative py-24 px-4">
      <DotPattern className="opacity-30" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                {t("upgrade.faq.eyebrow")}
              </p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {t("upgrade.faq.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("upgrade.faq.subtitle")}
            </p>
          </div>
        </BlurFade>

        <div className="flex flex-col gap-3">
          {faqItems.map((faq, i) => (
            <BlurFade key={faq.question} delay={i * 100}>
              <div className="glass rounded-xl overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span className="text-sm font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300",
                      openIndex === i && "rotate-180 text-primary"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openIndex === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

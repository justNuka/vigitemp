"use client";

import { ScrollProgress } from "@/components/ui/scroll-progress";
import { UpgradeToc } from "./UpgradeToc";
import { BackToTop } from "./BackToTop";
import { ServicesNavbar } from "@/components/services/ServicesNavbar";
import { HeroSection } from "./HeroSection";
import { ValuePropsSection } from "./ValuePropsSection";
import { CompareSection } from "./CompareSection";
import { ArchitectureSection } from "./ArchitectureSection";
import { PlansSection } from "./PlansSection";
import { LicenseTableSection } from "./LicenseTableSection";
import { StandardDeepDiveSection } from "./StandardDeepDiveSection";
import { ExpertTeaserSection } from "./ExpertTeaserSection";
import { FAQSection } from "./FAQSection";
import { FinalCTASection } from "./FinalCTASection";
import { useTranslations } from "next-intl";
import { getNavLinks } from "./upgradeContent";

export function UpgradePageClient() {
  const t = useTranslations();
  const navLinks = getNavLinks(t);
  const navItems = navLinks.map((link) => ({ name: link.label, link: link.href }));
  const compactItems = [
    { name: t("upgrade.nav.comparaison"), link: "#comparaison" },
    { name: t("upgrade.nav.licences"), link: "#licences" },
    { name: t("upgrade.nav.contact"), link: "#contact" },
  ];

  return (
    <div className="relative min-h-screen">
      <ScrollProgress />
      <ServicesNavbar
        items={navItems}
        compactItems={compactItems}
        badge={{ label: t("upgrade.nav.licenseLabel"), value: "One" }}
        cta={{ label: t("upgrade.nav.homeCta"), href: "#intro" }}
      />
      <UpgradeToc />
      <BackToTop />

      <main>
        <HeroSection />
        <ValuePropsSection />
        <CompareSection />
        <ArchitectureSection />
        <PlansSection />
        <LicenseTableSection />
        <StandardDeepDiveSection />
        <ExpertTeaserSection />
        <FAQSection />
        <FinalCTASection />
      </main>
    </div>
  );
}

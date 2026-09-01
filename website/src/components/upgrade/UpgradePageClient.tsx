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
import { getCompareItemsForEdition, getNavLinks } from "./upgradeContent";
import { useLicense } from "@/components/license/license-provider";
import { getLicenseEdition } from "@/lib/license-access";

export function UpgradePageClient() {
  const t = useTranslations();
  const { license } = useLicense();
  const edition = getLicenseEdition(license, "one");
  const shouldShowComparison = getCompareItemsForEdition(t, edition).length > 0;
  const navLinks = getNavLinks(t).filter((link) => shouldShowComparison || link.href !== "#comparaison");
  const navItems = navLinks.map((link) => ({ name: link.label, link: link.href }));
  const compactItems = [
    ...(shouldShowComparison ? [{ name: t("upgrade.nav.comparaison"), link: "#comparaison" }] : []),
    { name: t("upgrade.nav.licences"), link: "#licences" },
  ];

  const licenseLabel = t(`upgrade.licenses.table.${edition}` as const);

  return (
    <div className="relative min-h-screen">
      <ScrollProgress />
      <ServicesNavbar
        items={navItems}
        compactItems={compactItems}
        badge={{ label: t("upgrade.nav.licenseLabel"), value: licenseLabel }}
        cta={{ label: t("upgrade.nav.homeCta"), href: "#intro" }}
      />
      <UpgradeToc includeComparison={shouldShowComparison} />
      <BackToTop />

      <main>
        <HeroSection />
        <ValuePropsSection />
        <CompareSection edition={edition} />
        <ArchitectureSection />
        <PlansSection />
        <LicenseTableSection edition={edition} />
        <StandardDeepDiveSection />
        <ExpertTeaserSection />
        <FAQSection />
        <FinalCTASection />
      </main>
    </div>
  );
}

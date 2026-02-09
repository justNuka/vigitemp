"use client";

import { ScrollProgress } from "@/components/ui/scroll-progress";
import { UpgradeToc } from "./UpgradeToc";
import { BackToTop } from "./BackToTop";
import { UpgradeNavbar } from "./UpgradeNavbar";
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

export function UpgradePageClient() {
  return (
    <div className="relative min-h-screen">
      <ScrollProgress />
      <UpgradeNavbar />
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

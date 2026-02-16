import {
  Shield,
  Activity,
  FileCheck,
  Target,
  MessageSquare,
  Lock,
  Thermometer,
  Server,
  Database,
  Globe,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type UpgradeTranslator = (
  key: string,
  values?: Record<string, string | number | Date>
) => string;

export const getNavLinks = (t: UpgradeTranslator) => [
  { label: t("upgrade.nav.pourquoi"), href: "#pourquoi" },
  { label: t("upgrade.nav.comparaison"), href: "#comparaison" },
  { label: t("upgrade.nav.standard"), href: "#standard" },
  { label: t("upgrade.nav.expert"), href: "#expert" },
  { label: t("upgrade.nav.licences"), href: "#licences" },
];

export const getTocItems = (t: UpgradeTranslator) => [
  { id: "intro", label: t("upgrade.toc.intro") },
  { id: "pourquoi", label: t("upgrade.toc.pourquoi") },
  { id: "comparaison", label: t("upgrade.toc.comparaison") },
  { id: "architecture", label: t("upgrade.toc.architecture") },
  { id: "plans", label: t("upgrade.toc.plans") },
  { id: "licences", label: t("upgrade.toc.licences") },
  { id: "standard", label: t("upgrade.toc.standard") },
  { id: "expert", label: t("upgrade.toc.expert") },
  { id: "securite", label: t("upgrade.toc.securite") },
  { id: "contact", label: t("upgrade.toc.contact") },
];

export const getHeroContent = (t: UpgradeTranslator) => ({
  title: t("upgrade.hero.title"),
  titleHighlight: t("upgrade.hero.titleHighlight"),
  subtitle: t("upgrade.hero.subtitle"),
  subtitleHighlights: [
    t("upgrade.hero.subtitleHighlights.0"),
    t("upgrade.hero.subtitleHighlights.1"),
    t("upgrade.hero.subtitleHighlights.2"),
  ],
  tagline: t("upgrade.hero.tagline"),
  ctaPrimary: t("upgrade.hero.ctaPrimary"),
  ctaSecondary: t("upgrade.hero.ctaSecondary"),
});

export const getHeroParallaxProducts = (t: UpgradeTranslator) => [
  {
    title: t("upgrade.heroParallax.items.0.title"),
    link: "#surveillance",
    thumbnail: "/images/upgrade_licence/dashboard.png",
  },
  {
    title: t("upgrade.heroParallax.items.1.title"),
    link: "#surveillance",
    thumbnail: "/images/upgrade_licence/surveillance1.png",
  },
  {
    title: t("upgrade.heroParallax.items.2.title"),
    link: "#surveillance",
    thumbnail: "/images/upgrade_licence/surveillance2.png",
  },
  {
    title: t("upgrade.heroParallax.items.3.title"),
    link: "#standard",
    thumbnail: "/images/upgrade_licence/dashboard.png",
  },
  {
    title: t("upgrade.heroParallax.items.4.title"),
    link: "#pourquoi",
    thumbnail: "/images/upgrade_licence/surveillance1.png",
  },
  {
    title: t("upgrade.heroParallax.items.5.title"),
    link: "#securite",
    thumbnail: "/images/upgrade_licence/surveillance2.png",
  },
  {
    title: t("upgrade.heroParallax.items.6.title"),
    link: "#surveillance",
    thumbnail: "/images/upgrade_licence/dashboard.png",
  },
  {
    title: t("upgrade.heroParallax.items.7.title"),
    link: "#standard",
    thumbnail: "/images/upgrade_licence/surveillance1.png",
  },
  {
    title: t("upgrade.heroParallax.items.8.title"),
    link: "#standard",
    thumbnail: "/images/upgrade_licence/surveillance2.png",
  },
  {
    title: t("upgrade.heroParallax.items.9.title"),
    link: "#licences",
    thumbnail: "/images/upgrade_licence/dashboard.png",
  },
  {
    title: t("upgrade.heroParallax.items.10.title"),
    link: "#pourquoi",
    thumbnail: "/images/upgrade_licence/surveillance1.png",
  },
  {
    title: t("upgrade.heroParallax.items.11.title"),
    link: "#securite",
    thumbnail: "/images/upgrade_licence/surveillance2.png",
  },
  {
    title: t("upgrade.heroParallax.items.12.title"),
    link: "#surveillance",
    thumbnail: "/images/upgrade_licence/dashboard.png",
  },
  {
    title: t("upgrade.heroParallax.items.13.title"),
    link: "#plans",
    thumbnail: "/images/upgrade_licence/surveillance1.png",
  },
  {
    title: t("upgrade.heroParallax.items.14.title"),
    link: "#comparaison",
    thumbnail: "/images/upgrade_licence/surveillance2.png",
  },
];

export const getProofStats = (t: UpgradeTranslator) => [
  {
    title: t("upgrade.proofStats.items.0.title"),
    description: t("upgrade.proofStats.items.0.description"),
    highlight: true,
  },
  {
    title: t("upgrade.proofStats.items.1.title"),
    description: t("upgrade.proofStats.items.1.description"),
    highlight: false,
  },
  {
    title: t("upgrade.proofStats.items.2.title"),
    description: t("upgrade.proofStats.items.2.description"),
    highlight: false,
  },
  {
    title: t("upgrade.proofStats.items.3.title"),
    description: t("upgrade.proofStats.items.3.description"),
    highlight: false,
  },
];

export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

export const getValueProps = (t: UpgradeTranslator): ValueProp[] => [
  {
    icon: Shield,
    title: t("upgrade.valueProps.items.0.title"),
    description: t("upgrade.valueProps.items.0.description"),
    badge: t("upgrade.valueProps.items.0.badge"),
  },
  {
    icon: Activity,
    title: t("upgrade.valueProps.items.1.title"),
    description: t("upgrade.valueProps.items.1.description"),
    badge: t("upgrade.valueProps.items.1.badge"),
  },
  {
    icon: FileCheck,
    title: t("upgrade.valueProps.items.2.title"),
    description: t("upgrade.valueProps.items.2.description"),
    badge: t("upgrade.valueProps.items.2.badge"),
  },
  {
    icon: Target,
    title: t("upgrade.valueProps.items.3.title"),
    description: t("upgrade.valueProps.items.3.description"),
    badge: t("upgrade.valueProps.items.3.badge"),
  },
  {
    icon: MessageSquare,
    title: t("upgrade.valueProps.items.4.title"),
    description: t("upgrade.valueProps.items.4.description"),
    badge: t("upgrade.valueProps.items.4.badge"),
  },
  {
    icon: Lock,
    title: t("upgrade.valueProps.items.5.title"),
    description: t("upgrade.valueProps.items.5.description"),
    badge: t("upgrade.valueProps.items.5.badge"),
  },
];

export const getCompareItems = (t: UpgradeTranslator) => [
  {
    id: "surveillance",
    title: t("upgrade.compare.items.0.title"),
    leftLabel: t("upgrade.compare.items.0.leftLabel"),
    rightLabel: t("upgrade.compare.items.0.rightLabel"),
    leftItems: [
      t("upgrade.compare.items.0.leftItems.0"),
      t("upgrade.compare.items.0.leftItems.1"),
      t("upgrade.compare.items.0.leftItems.2"),
    ],
    rightItems: [
      t("upgrade.compare.items.0.rightItems.0"),
      t("upgrade.compare.items.0.rightItems.1"),
      t("upgrade.compare.items.0.rightItems.2"),
    ],
  },
  {
    id: "metrologie",
    title: t("upgrade.compare.items.1.title"),
    leftLabel: t("upgrade.compare.items.1.leftLabel"),
    rightLabel: t("upgrade.compare.items.1.rightLabel"),
    leftItems: [
      t("upgrade.compare.items.1.leftItems.0"),
      t("upgrade.compare.items.1.leftItems.1"),
      t("upgrade.compare.items.1.leftItems.2"),
    ],
    rightItems: [
      t("upgrade.compare.items.1.rightItems.0"),
      t("upgrade.compare.items.1.rightItems.1"),
      t("upgrade.compare.items.1.rightItems.2"),
    ],
  },
];

export const getArchitectureNodes = (t: UpgradeTranslator) => [
  {
    id: "sondes",
    label: t("upgrade.architecture.nodes.sondes.label"),
    sublabel: t("upgrade.architecture.nodes.sondes.sublabel"),
    icon: Thermometer,
  },
  {
    id: "serveur",
    label: t("upgrade.architecture.nodes.serveur.label"),
    sublabel: t("upgrade.architecture.nodes.serveur.sublabel"),
    icon: Server,
  },
  {
    id: "bdd",
    label: t("upgrade.architecture.nodes.bdd.label"),
    sublabel: t("upgrade.architecture.nodes.bdd.sublabel"),
    icon: Database,
  },
  {
    id: "webapp",
    label: t("upgrade.architecture.nodes.webapp.label"),
    sublabel: t("upgrade.architecture.nodes.webapp.sublabel"),
    icon: Globe,
  },
  {
    id: "agent",
    label: t("upgrade.architecture.nodes.agent.label"),
    sublabel: t("upgrade.architecture.nodes.agent.sublabel"),
    icon: Bell,
  },
];

export const getArchitectureLeft = (t: UpgradeTranslator) => ({
  title: t("upgrade.architecture.left.title"),
  items: [
    t("upgrade.architecture.left.items.0"),
    t("upgrade.architecture.left.items.1"),
    t("upgrade.architecture.left.items.2"),
  ],
});

export const getArchitectureRight = (t: UpgradeTranslator) => ({
  title: t("upgrade.architecture.right.title"),
  items: [
    t("upgrade.architecture.right.items.0"),
    t("upgrade.architecture.right.items.1"),
    t("upgrade.architecture.right.items.2"),
  ],
});

export interface LicenseFeature {
  name: string;
  pack: boolean | string;
  one: boolean | string;
  standard: boolean | string;
  expert: boolean | string;
}

export const getLicenseFeatures = (t: UpgradeTranslator): LicenseFeature[] => [
  { name: t("upgrade.licenses.features.0"), pack: true, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.1"), pack: true, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.2"), pack: true, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.3"), pack: true, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.4"), pack: true, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.5"), pack: true, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.6"), pack: false, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.7"), pack: false, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.8"), pack: false, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.9"), pack: false, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.10"), pack: false, one: true, standard: true, expert: true },
  { name: t("upgrade.licenses.features.11"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.12"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.13"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.14"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.15"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.16"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.17"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.18"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.19"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.20"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.21"), pack: false, one: false, standard: true, expert: true },
  { name: t("upgrade.licenses.features.22"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.23"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.24"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.25"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.26"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.27"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.28"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.29"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.30"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.31"), pack: false, one: false, standard: false, expert: true },
  { name: t("upgrade.licenses.features.32"), pack: false, one: false, standard: false, expert: true },
];

export const getStandardBlocks = (t: UpgradeTranslator) => [
  {
    title: t("upgrade.standard.blocks.0.title"),
    bullets: [
      t("upgrade.standard.blocks.0.bullets.0"),
      t("upgrade.standard.blocks.0.bullets.1"),
      t("upgrade.standard.blocks.0.bullets.2"),
      t("upgrade.standard.blocks.0.bullets.3"),
    ],
  },
  {
    title: t("upgrade.standard.blocks.1.title"),
    bullets: [
      t("upgrade.standard.blocks.1.bullets.0"),
      t("upgrade.standard.blocks.1.bullets.1"),
      t("upgrade.standard.blocks.1.bullets.2"),
      t("upgrade.standard.blocks.1.bullets.3"),
    ],
  },
  {
    title: t("upgrade.standard.blocks.2.title"),
    bullets: [
      t("upgrade.standard.blocks.2.bullets.0"),
      t("upgrade.standard.blocks.2.bullets.1"),
      t("upgrade.standard.blocks.2.bullets.2"),
      t("upgrade.standard.blocks.2.bullets.3"),
    ],
  },
  {
    title: t("upgrade.standard.blocks.3.title"),
    bullets: [
      t("upgrade.standard.blocks.3.bullets.0"),
      t("upgrade.standard.blocks.3.bullets.1"),
      t("upgrade.standard.blocks.3.bullets.2"),
      t("upgrade.standard.blocks.3.bullets.3"),
    ],
  },
];

export const getExpertCards = (t: UpgradeTranslator) => [
  {
    title: t("upgrade.expert.cards.0.title"),
    description: t("upgrade.expert.cards.0.description"),
  },
  {
    title: t("upgrade.expert.cards.1.title"),
    description: t("upgrade.expert.cards.1.description"),
  },
  {
    title: t("upgrade.expert.cards.2.title"),
    description: t("upgrade.expert.cards.2.description"),
  },
  {
    title: t("upgrade.expert.cards.3.title"),
    description: t("upgrade.expert.cards.3.description"),
  },
];

export const getFaqItems = (t: UpgradeTranslator) => [
  {
    question: t("upgrade.faq.items.0.question"),
    answer: t("upgrade.faq.items.0.answer"),
  },
  {
    question: t("upgrade.faq.items.1.question"),
    answer: t("upgrade.faq.items.1.answer"),
  },
  {
    question: t("upgrade.faq.items.2.question"),
    answer: t("upgrade.faq.items.2.answer"),
  },
  {
    question: t("upgrade.faq.items.3.question"),
    answer: t("upgrade.faq.items.3.answer"),
  },
  {
    question: t("upgrade.faq.items.4.question"),
    answer: t("upgrade.faq.items.4.answer"),
  },
];

export const getContactInfo = (t: UpgradeTranslator) => ({
  email: t("upgrade.contact.values.email"),
  phone: t("upgrade.contact.values.phone"),
  responseTime: t("upgrade.contact.values.responseTime"),
  installation: t("upgrade.contact.values.installation"),
});

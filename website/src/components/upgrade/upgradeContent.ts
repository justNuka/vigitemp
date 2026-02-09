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

/* ───── NAV LINKS ───── */
export const navLinks = [
  { label: "Pourquoi upgrader", href: "#pourquoi" },
  { label: "Comparaison", href: "#comparaison" },
  { label: "Standard", href: "#standard" },
  { label: "Expert", href: "#expert" },
  { label: "Licences", href: "#licences" },
  { label: "Contact", href: "#contact" },
];

/* ───── TOC ITEMS ───── */
export const tocItems = [
  { id: "intro", label: "Introduction" },
  { id: "pourquoi", label: "Pourquoi upgrader" },
  { id: "comparaison", label: "Comparaison" },
  { id: "architecture", label: "Architecture" },
  { id: "plans", label: "Plans & Sondes" },
  { id: "licences", label: "Licences" },
  { id: "standard", label: "Standard" },
  { id: "expert", label: "Expert" },
  { id: "securite", label: "Securite" },
  { id: "contact", label: "Contact" },
];

/* ───── HERO ───── */
export const heroContent = {
  title: "VigiSensys",
  titleHighlight: "metrologie plus intelligente",
  subtitle:
    "Surveillance + metrologie reunies dans une centrale 100% on-premise.",
  subtitleHighlights: ["securite", "conformite", "performance"],
  tagline: "Vos donnees restent chez vous.",
  ctaPrimary: "Passer a Standard",
  ctaSecondary: "Comparer les licences",
};

/* ───── PROOF STATS ───── */
export const proofStats = [
  {
    title: "100% on-premise",
    description: "Aucune donnee dans le cloud",
    highlight: true,
  },
  {
    title: "Alarmes temps reel",
    description: "Detection instantanee des ecarts",
    highlight: false,
  },
  {
    title: "Tracabilite metrologique",
    description: "Historique complet et auditable",
    highlight: false,
  },
  {
    title: "Notifications Windows",
    description: "Meme navigateur ferme",
    highlight: false,
  },
];

/* ───── VALUE PROPS ───── */
export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

export const valueProps: ValueProp[] = [
  {
    icon: Shield,
    title: "Reduire les non-conformites",
    description: "Detectez derive et ecarts plus tot grace au suivi continu.",
    badge: "Standard",
  },
  {
    icon: Activity,
    title: "Accelerer le calibrage",
    description:
      "Calibrage 2 points, suivi historique, coefficients automatiques.",
    badge: "Standard",
  },
  {
    icon: FileCheck,
    title: "Renforcer la tracabilite",
    description: "Rapports, historique, parametres : tout est enregistre.",
    badge: "Standard",
  },
  {
    icon: Target,
    title: "Standardiser les EMT par lieu",
    description: "Tolerances maitrisees site par site, zone par zone.",
    badge: "Standard",
  },
  {
    icon: MessageSquare,
    title: "Collaborer sans perdre d'infos",
    description: "Messagerie interne et tracabilite des echanges.",
    badge: "Standard",
  },
  {
    icon: Lock,
    title: "Securite au coeur",
    description: "Roles, audit, logique on-prem. Zero compromis.",
    badge: "Standard",
  },
];

/* ───── COMPARE ───── */
export const compareItems = [
  {
    id: "surveillance",
    title: "Surveillance",
    leftLabel: "One",
    rightLabel: "Standard",
    leftItems: [
      "Cards basiques",
      "Graphiques simples",
      "Alarmes simples",
    ],
    rightItems: [
      "Indicateurs metrologie avances",
      "Detection de derive en temps reel",
      "Historique complet des ecarts",
    ],
    gains: [
      "Visibilite sur la derive avant non-conformite",
      "Indicateurs metrologie integres",
      "Historique complet auditable",
    ],
  },
  {
    id: "metrologie",
    title: "Metrologie",
    leftLabel: "Basique",
    rightLabel: "Standard",
    leftItems: [
      "Pas de calibrage",
      "Pas d'incertitude",
      "Pas d'ajustage",
    ],
    rightItems: [
      "Calibrage 2 points + historique",
      "Incertitude + justesse",
      "Derive et coefficients a/b",
    ],
    gains: [
      "Calibrage 2 points avec tracabilite",
      "Calcul d'incertitude automatique",
      "Gestion complete de la derive",
    ],
  },
];

/* ───── ARCHITECTURE ───── */
export const architectureNodes = [
  { id: "sondes", label: "Sondes", sublabel: "Temp, HR, CO2...", icon: Thermometer },
  { id: "serveur", label: "Serveur C#", sublabel: "Interrogation + Alarmes", icon: Server },
  { id: "bdd", label: "Base de donnees", sublabel: "Mesures / Metier", icon: Database },
  { id: "webapp", label: "Web App", sublabel: "Next.js", icon: Globe },
  { id: "agent", label: "Agent Windows", sublabel: "Notifications", icon: Bell },
];

export const architectureLeft = {
  title: "Pourquoi c'est robuste",
  items: [
    "Fonctionne offline / LAN",
    "Performance industrielle",
    "Centralisation des donnees",
  ],
};

export const architectureRight = {
  title: "Pourquoi c'est securise",
  items: [
    "Donnees chez vous uniquement",
    "Controle d'acces granulaire",
    "Logs et audit complets",
  ],
};

/* ───── LICENSE TABLE ───── */
export interface LicenseFeature {
  name: string;
  one: boolean | string;
  standard: boolean | string;
  expert: boolean | string;
}

export const licenseFeatures: LicenseFeature[] = [
  { name: "Surveillance (cards + graph)", one: true, standard: true, expert: true },
  { name: "Alarmes & tolerances", one: true, standard: true, expert: true },
  { name: "Notifications Windows agent", one: true, standard: true, expert: true },
  { name: "Metrologie (calibrage 2 points)", one: false, standard: true, expert: true },
  { name: "Ajustage : coeff a/b", one: false, standard: true, expert: true },
  { name: "Ajustage : justesse + incertitude", one: false, standard: true, expert: true },
  { name: "Gestion derive", one: false, standard: true, expert: true },
  { name: "Messagerie interne", one: false, standard: true, expert: true },
  { name: "EMT par lieu", one: false, standard: true, expert: true },
  { name: "Dashboard personnalisable", one: false, standard: false, expert: true },
  { name: "IA assistant", one: false, standard: false, expert: true },
  { name: "Analyse temps reel", one: false, standard: false, expert: true },
  { name: "Ecosysteme interventions", one: false, standard: false, expert: true },
];

/* ───── STANDARD DEEP DIVE ───── */
export const standardBlocks = [
  {
    title: "Calibrage 2 points + historique",
    bullets: [
      "Definissez vos 2 points de reference",
      "Historique de chaque operation",
      "Certificats de calibrage integres",
      "Tracabilite complete par sonde",
    ],
  },
  {
    title: "Gestion de derive & tracabilite",
    bullets: [
      "Suivi de derive automatique",
      "Alertes sur seuil de derive",
      "Graphiques d'evolution",
      "Export PDF pour audit",
    ],
  },
  {
    title: "Ajustage (coeff a/b)",
    bullets: [
      "Calcul automatique des coefficients",
      "Application en temps reel",
      "Historique des ajustages",
      "Comparaison avant/apres",
    ],
  },
  {
    title: "Ajustage (justesse + incertitude)",
    bullets: [
      "Calcul d'incertitude type A et B",
      "Justesse mesuree et tracee",
      "Rapports conformes aux normes",
      "Integration au workflow qualite",
    ],
  },
];

/* ───── EXPERT CARDS ───── */
export const expertCards = [
  {
    title: "Dashboard tuiles",
    description: "Add / remove / resize / drag : construisez votre vue.",
  },
  {
    title: "Chatbot IA",
    description: "Troubleshooting intelligent, contexte capteur integre.",
  },
  {
    title: "Analyse temps reel",
    description: "Evenements + mesures croises, detection de patterns.",
  },
  {
    title: "Ecosysteme interventions",
    description: "Planification technicien, suivi MC2 complet.",
  },
];

/* ───── FAQ ───── */
export const faqItems = [
  {
    question: "Les donnees sortent-elles de notre site ?",
    answer:
      "Non. VigiSensys fonctionne a 100% en on-premise. Aucune donnee ne transite par le cloud. Tout reste sur votre infrastructure locale.",
  },
  {
    question: "Fonctionne-t-il sans internet ?",
    answer:
      "Oui. Le systeme fonctionne en LAN complet. La connexion internet n'est pas necessaire pour le fonctionnement quotidien.",
  },
  {
    question: "Comment se passe l'upgrade ?",
    answer:
      "Simple : nouvelle cle de licence, redemarrage des services si necessaire. Aucune perte de donnees, migration automatique des parametres.",
  },
  {
    question: "Quel support MC2 est disponible ?",
    answer:
      "Support technique, interventions sur site, formation. Options personnalisables selon vos besoins.",
  },
  {
    question: "Quelle est la politique de mises a jour ?",
    answer:
      "Mises a jour incluses dans la licence active. Deploiement controle par vos equipes IT, a votre rythme.",
  },
];

/* ───── CONTACT ───── */
export const contactInfo = {
  email: "contact@mc2-info.com",
  phone: "+33 (0)4 XX XX XX XX",
  responseTime: "< 24h en moyenne",
  installation: "Installation 100% sur site",
};

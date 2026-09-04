"use client"

import { useLocale } from "next-intl"
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  KeyRound,
  PhoneCall,
  Server,
  ShieldCheck,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const LINKS = {
  manager: "https://www.ovh.com/manager/",
  voipOffers: "https://www.ovhcloud.com/fr/phone/voip/",
  sipTrunk: "https://www.ovhcloud.com/fr/phone/sip-trunk/",
  click2Call: "https://docs.ovhcloud.com/fr/guides/web-cloud/phone-and-fax/voip/configurer-utiliser-click2call",
  apiFirstSteps: "https://docs.ovhcloud.com/fr/guides/manage-and-operate/api/first-steps",
  createToken: "https://eu.api.ovh.com/createToken/",
} as const

type LinkKey = keyof typeof LINKS
type LocaleKey = "fr" | "en"

type GuideCopy = {
  brand: string
  trigger: string
  title: string
  description: string
  verified: string
  recommendationTitle: string
  recommendationBody: string
  needsTitle: string
  needs: string[]
  offersTitle: string
  offersIntro: string
  offers: Array<{
    name: string
    badge: string
    description: string
    recommendation: string
  }>
  catalogWarning: string
  stepsTitle: string
  steps: Array<{
    id: string
    title: string
    intro: string
    items: string[]
    code?: string
    note?: string
    links?: LinkKey[]
  }>
  mappingTitle: string
  mappingIntro: string
  mapping: Array<{ field: string; source: string; example: string; secret?: boolean }>
  firstCallTitle: string
  firstCallItems: string[]
  click2CallWarning: string
  asteriskTitle: string
  asteriskBody: string
  asteriskItems: string[]
  securityTitle: string
  securityItems: string[]
  checklistTitle: string
  checklist: string[]
  officialTitle: string
  officialBody: string
  officialLinks: Record<LinkKey, string>
  closeHint: string
}

const COPY: Record<LocaleKey, GuideCopy> = {
  fr: {
    brand: "OVHcloud",
    trigger: "Guide OVHcloud",
    title: "Configurer OVHcloud pour VigiSensys",
    description:
      "Guide pas à pas pour choisir l'offre, récupérer les identifiants et tester la téléphonie sans connaissance préalable de la VoIP.",
    verified: "Vérifié avec la documentation OVHcloud disponible au 02/09/2026.",
    recommendationTitle: "Recommandation VigiSensys",
    recommendationBody:
      "Commencez par Click2Call pour valider la ligne et l'API. Pour les futures alarmes vocales automatiques avec message audio, DTMF et escalade, la cible recommandée est Asterisk connecté à la ligne SIP ou à un SIP Trunk.",
    needsTitle: "Pour le test Click2Call actuel, il vous faut",
    needs: [
      "une ligne compatible Click2Call",
      "Application Key + Application Secret + Consumer Key",
      "le groupe de téléphonie / Billing Account",
      "le Service Name de la ligne",
      "le Caller ID",
      "un identifiant Click2Call",
    ],
    offersTitle: "1. Choisir l'offre OVHcloud",
    offersIntro:
      "Le catalogue évolue : vérifiez toujours l'offre au moment de commander. Pour le fonctionnement actuel, l'offre doit annoncer explicitement Click2Call.",
    offers: [
      {
        name: "VoIP Découverte",
        badge: "À vérifier",
        description: "Offre VoIP simple. Click2Call n'est pas annoncé dans la comparaison OVHcloud actuellement publiée.",
        recommendation: "À éviter pour le premier test Click2Call sauf confirmation explicite d'OVHcloud.",
      },
      {
        name: "VoIP Entreprise",
        badge: "Bon point de départ",
        description: "Click2Call est annoncé et l'offre convient à une première intégration VigiSensys.",
        recommendation: "Recommandée pour valider Click2Call si la tarification mobile convient au besoin.",
      },
      {
        name: "VoIP Entreprise+",
        badge: "Usage mobile",
        description: "Click2Call est annoncé et l'offre courante inclut davantage d'usage mobile.",
        recommendation: "À privilégier si les alarmes doivent principalement joindre des mobiles.",
      },
      {
        name: "SIP Trunk",
        badge: "IPBX / montée en charge",
        description: "Offre conçue pour IPBX, UC ou SBC avec un nombre de canaux dimensionnable.",
        recommendation: "À envisager avec Asterisk pour une installation industrielle ; inutile pour le premier PoC.",
      },
    ],
    catalogWarning:
      "Tarifs, destinations incluses, appels simultanés et fonctionnalités peuvent changer. Ce guide explique le choix technique mais ne remplace pas le catalogue OVHcloud.",
    stepsTitle: "2. Préparer OVHcloud étape par étape",
    steps: [
      {
        id: "line",
        title: "A — Trouver le groupe et la ligne",
        intro: "Commencez dans l'espace client OVHcloud.",
        items: [
          "Télécom → VoIP & Fax → sélectionnez le groupe de téléphonie.",
          "Le nom du groupe, généralement de la forme xx12345-ovh-1, est le Billing Account.",
          "Dans les Services du groupe, sélectionnez la ligne SIP concernée.",
          "Relevez le Service Name au format international tel qu'OVHcloud l'affiche.",
          "Relevez le numéro autorisé comme Caller ID ; pour le premier test, utilisez de préférence la ligne elle-même.",
        ],
        links: ["manager"],
      },
      {
        id: "api",
        title: "B — Créer les trois clés API",
        intro: "VigiSensys signe les appels API OVHcloud avec trois clés dédiées.",
        items: [
          "Connectez-vous avec le compte OVHcloud qui possède la ligne.",
          "Créez une application dédiée, par exemple VigiSensys Telephony.",
          "Pour le premier test, autorisez GET /telephony/* et POST /telephony/*.",
          "Sauvegardez immédiatement Application Key (AK), Application Secret (AS) et Consumer Key (CK).",
          "AS et CK sont des secrets : ne les envoyez pas par mail, capture, issue ou PR.",
          "Après validation, réduisez les droits aux routes strictement nécessaires si possible.",
        ],
        code: "GET  /telephony/*\nPOST /telephony/*",
        links: ["createToken", "apiFirstSteps"],
      },
      {
        id: "click2call",
        title: "C — Créer ou retrouver l'identifiant Click2Call",
        intro: "Click2Call utilise un identifiant dédié, différent du compte SIP.",
        items: [
          "Ligne OVHcloud → Gestion des appels → Appel en 1 clic (Click2Call).",
          "S'il existe déjà un identifiant, conservez son ID pour VigiSensys.",
          "Sinon, créez un login dédié, par exemple vigisensys_alarm, avec un mot de passe fort.",
          "Vous pouvez aussi renseigner login + mot de passe dans VigiSensys, enregistrer, puis utiliser le bouton de création Click2Call.",
          "Le login/mot de passe Click2Call n'est pas le login/mot de passe SIP.",
        ],
        links: ["click2Call"],
      },
      {
        id: "save",
        title: "D — Renseigner et enregistrer VigiSensys",
        intro: "Sélectionnez OVHcloud dans la carte Téléphonie puis renseignez les champs.",
        items: [
          "Point d'accès : ovh-eu pour un compte européen.",
          "Caller ID : numéro présenté autorisé par OVHcloud.",
          "Application Key / Secret / Consumer Key : les trois clés API.",
          "Compte de facturation : nom du groupe OVHcloud.",
          "Nom du service / ligne : ligne SIP au format international OVHcloud.",
          "ID Click2Call : ID de l'identifiant sélectionné ou créé.",
          "Cliquez sur Enregistrer avant toute action de test.",
        ],
        note: "Les routes de test utilisent la configuration sauvegardée côté serveur. Ne testez pas avec des changements non enregistrés.",
      },
      {
        id: "test",
        title: "E — Tester dans le bon ordre",
        intro: "Validez chaque étage séparément pour faciliter le diagnostic.",
        items: [
          "1. Tester la connexion : clés, groupe, ligne et accès aux identifiants Click2Call.",
          "2. Créer l'utilisateur Click2Call si nécessaire.",
          "3. Enregistrer de nouveau si la configuration a changé.",
          "4. Saisir un numéro de test au format international.",
          "5. Tester l'appel.",
          "6. Vérifier le numéro présenté et la facturation réelle.",
        ],
      },
      {
        id: "sip",
        title: "F — Conserver les informations SIP pour Asterisk",
        intro: "Elles ne servent pas au Click2Call actuel mais seront nécessaires pour le PoC Asterisk.",
        items: [
          "Login / User name SIP et Authorization user name.",
          "Mot de passe SIP, conservé dans un coffre de secrets et jamais dans Git.",
          "Domain / Registrar et Proxy sortant.",
          "Codecs autorisés.",
          "Capacité et nombre d'appels simultanés.",
        ],
      },
      {
        id: "diagnostic",
        title: "G — Si un test échoue",
        intro: "Identifiez d'abord l'étage en échec.",
        items: [
          "401/403 : vérifier AK/AS/CK, droits API, endpoint et horloge du serveur.",
          "Groupe introuvable : le Billing Account est le nom du groupe, pas le numéro de ligne.",
          "Ligne introuvable : reprendre exactement le Service Name affiché ou retourné par OVHcloud.",
          "Aucun utilisateur : créer un identifiant Click2Call.",
          "Appel refusé : vérifier Caller ID, destination, restrictions de ligne, forfait et hors-forfait.",
          "Si le Caller ID est refusé, tester le format international exact du Service Name.",
        ],
      },
    ],
    mappingTitle: "3. Correspondance des champs VigiSensys",
    mappingIntro: "Chaque valeur OVHcloud a un emplacement précis dans la configuration.",
    mapping: [
      { field: "Point d'accès", source: "Zone du compte", example: "ovh-eu" },
      { field: "Caller ID", source: "Numéro présenté autorisé", example: "ligne au format international" },
      { field: "Application Key", source: "Portail API OVHcloud", example: "AK…", secret: true },
      { field: "Application Secret", source: "Portail API OVHcloud", example: "AS…", secret: true },
      { field: "Consumer Key", source: "Portail API OVHcloud", example: "CK…", secret: true },
      { field: "Compte de facturation", source: "Nom du groupe VoIP", example: "xx12345-ovh-1" },
      { field: "Nom du service / ligne", source: "Ligne SIP OVHcloud", example: "0033…" },
      { field: "Id utilisateur Click2Call", source: "Identifiant Click2Call", example: "ID numérique" },
      { field: "Login Click2Call", source: "Compte Click2Call dédié", example: "vigisensys_alarm", secret: true },
      { field: "Mot de passe Click2Call", source: "Compte Click2Call dédié", example: "mot de passe dédié", secret: true },
    ],
    firstCallTitle: "4. Ce que doit prouver le premier appel réel",
    firstCallItems: [
      "VigiSensys atteint l'API OVHcloud.",
      "Les clés et permissions sont correctes.",
      "Billing Account et Service Name ciblent la bonne ligne.",
      "La ligne Click2Call sonne comme prévu.",
      "Le destinataire est appelé.",
      "Le bon numéro est présenté.",
      "La facturation correspond à l'offre choisie.",
      "Aucun secret n'apparaît dans les logs.",
    ],
    click2CallWarning:
      "Click2Call met deux interlocuteurs en relation. Il ne permet pas encore à VigiSensys de lire lui-même le détail d'une alarme.",
    asteriskTitle: "5. Pourquoi Asterisk est prévu ensuite",
    asteriskBody:
      "Pour une vraie alarme vocale automatique, VigiSensys doit piloter l'appel, jouer un message, recevoir du DTMF et suivre l'état de la communication. Asterisk prendra cette couche téléphonique plutôt que de réimplémenter SIP/RTP dans VigiSensys.",
    asteriskItems: [
      "appel automatique sans opérateur humain côté VigiSensys",
      "lecture de fichiers audio ou TTS",
      "DTMF pour réécoute ou confirmation de réception",
      "retry et scénarios d'escalade",
      "statuts ringing / answered / busy / no-answer / completed",
      "SIP Trunk possible ensuite pour plusieurs canaux",
    ],
    securityTitle: "6. Sécurité",
    securityItems: [
      "AS, CK, mot de passe Click2Call et futur mot de passe SIP sont des secrets.",
      "Ne jamais les mettre dans Git, une PR, une capture ou un log.",
      "Utiliser des credentials dédiés à VigiSensys.",
      "Limiter les droits API au strict besoin.",
      "Révoquer immédiatement un token suspect ou exposé.",
      "Les secrets de téléphonie sont stockés via le mécanisme de chiffrement applicatif prévu par VigiSensys.",
    ],
    checklistTitle: "Checklist avant de fermer le guide",
    checklist: [
      "Offre compatible Click2Call confirmée",
      "Billing Account identifié",
      "Service Name identifié",
      "Caller ID identifié",
      "AK / AS / CK générées",
      "Droits GET/POST limités à /telephony/* pour le test",
      "Identifiant Click2Call disponible",
      "Configuration VigiSensys enregistrée",
      "Test connexion OK",
      "Appel de test OK",
      "Informations SIP conservées de manière sécurisée pour Asterisk",
    ],
    officialTitle: "Documentation officielle OVHcloud",
    officialBody:
      "Ces liens sont la source de vérité pour les offres et menus OVHcloud. Utilisez-les si l'interface diffère du guide.",
    officialLinks: {
      manager: "Espace client OVHcloud",
      voipOffers: "Offres VoIP OVHcloud",
      sipTrunk: "SIP Trunk OVHcloud",
      click2Call: "Guide Click2Call",
      apiFirstSteps: "Guide API OVHcloud",
      createToken: "Créer AK / AS / CK",
    },
    closeHint: "Vous pouvez rouvrir ce guide à tout moment depuis la carte Téléphonie.",
  },
  en: {
    brand: "OVHcloud",
    trigger: "OVHcloud guide",
    title: "Configure OVHcloud for VigiSensys",
    description:
      "Step-by-step guide to choose an offer, collect identifiers and test telephony without previous VoIP knowledge.",
    verified: "Checked against OVHcloud documentation available on 2026-09-02.",
    recommendationTitle: "VigiSensys recommendation",
    recommendationBody:
      "Start with Click2Call to validate the line and API. For future automated voice alarms with audio, DTMF and escalation, the recommended target is Asterisk connected to the SIP line or a SIP Trunk.",
    needsTitle: "For the current Click2Call test you need",
    needs: [
      "a Click2Call-compatible line",
      "Application Key + Application Secret + Consumer Key",
      "the telephony group / Billing Account",
      "the line Service Name",
      "the Caller ID",
      "a Click2Call identity",
    ],
    offersTitle: "1. Choose the OVHcloud offer",
    offersIntro:
      "The catalogue changes over time: always check it when ordering. For the current implementation, the offer must explicitly include Click2Call.",
    offers: [
      {
        name: "VoIP Discovery",
        badge: "Check first",
        description: "Simple VoIP offer. Click2Call is not currently listed in the published OVHcloud comparison.",
        recommendation: "Avoid for the first Click2Call test unless OVHcloud explicitly confirms support.",
      },
      {
        name: "VoIP Enterprise",
        badge: "Good starting point",
        description: "Click2Call is listed and the offer fits a first VigiSensys integration.",
        recommendation: "Recommended to validate Click2Call when mobile call pricing fits the use case.",
      },
      {
        name: "VoIP Enterprise+",
        badge: "Mobile usage",
        description: "Click2Call is listed and the current offer includes broader mobile usage.",
        recommendation: "Prefer when alarms mainly call mobile phones.",
      },
      {
        name: "SIP Trunk",
        badge: "IPBX / scale",
        description: "Offer designed for IPBX, UC or SBC with configurable channels.",
        recommendation: "Consider with Asterisk for industrial deployment; not required for the first PoC.",
      },
    ],
    catalogWarning:
      "Pricing, included destinations, concurrent calls and features can change. This guide explains the technical choice but does not replace the OVHcloud catalogue.",
    stepsTitle: "2. Prepare OVHcloud step by step",
    steps: [
      {
        id: "line",
        title: "A — Find the group and line",
        intro: "Start in the OVHcloud control panel.",
        items: [
          "Telecom → VoIP & Fax → select the telephony group.",
          "The group name, usually xx12345-ovh-1, is the Billing Account.",
          "In the group Services, select the relevant SIP line.",
          "Record the Service Name in the international format shown by OVHcloud.",
          "Record the allowed Caller ID; for the first test, prefer the line itself.",
        ],
        links: ["manager"],
      },
      {
        id: "api",
        title: "B — Create the three API keys",
        intro: "VigiSensys signs OVHcloud API requests with three dedicated keys.",
        items: [
          "Sign in with the OVHcloud account owning the line.",
          "Create a dedicated application such as VigiSensys Telephony.",
          "For the first test grant GET /telephony/* and POST /telephony/*.",
          "Immediately save Application Key (AK), Application Secret (AS) and Consumer Key (CK).",
          "AS and CK are secrets: never send them in email, screenshots, issues or PRs.",
          "After validation, narrow permissions to the required routes where possible.",
        ],
        code: "GET  /telephony/*\nPOST /telephony/*",
        links: ["createToken", "apiFirstSteps"],
      },
      {
        id: "click2call",
        title: "C — Create or find the Click2Call identity",
        intro: "Click2Call uses dedicated credentials, separate from the SIP account.",
        items: [
          "OVHcloud line → Call management → Click2Call.",
          "If an identity already exists, keep its ID for VigiSensys.",
          "Otherwise create a dedicated login such as vigisensys_alarm with a strong password.",
          "You can also enter login + password in VigiSensys, save, then use the Click2Call creation button.",
          "The Click2Call login/password is not the SIP login/password.",
        ],
        links: ["click2Call"],
      },
      {
        id: "save",
        title: "D — Fill and save VigiSensys",
        intro: "Select OVHcloud in the Telephony card and fill the fields.",
        items: [
          "Endpoint: ovh-eu for a European account.",
          "Caller ID: number OVHcloud allows the line to present.",
          "Application Key / Secret / Consumer Key: the three API keys.",
          "Billing Account: OVHcloud group name.",
          "Service Name: SIP line in OVHcloud international format.",
          "Click2Call ID: ID of the selected or created identity.",
          "Click Save before any test action.",
        ],
        note: "Test routes use the saved server-side configuration. Do not test with unsaved changes.",
      },
      {
        id: "test",
        title: "E — Test in the correct order",
        intro: "Validate each layer separately for easier diagnosis.",
        items: [
          "1. Test connection: keys, group, line and Click2Call access.",
          "2. Create the Click2Call user if required.",
          "3. Save again if the configuration changed.",
          "4. Enter an international test number.",
          "5. Test the call.",
          "6. Check the presented number and real billing.",
        ],
      },
      {
        id: "sip",
        title: "F — Keep SIP information for Asterisk",
        intro: "Not used by current Click2Call but required for the Asterisk PoC.",
        items: [
          "SIP Login / User name and Authorization user name.",
          "SIP password, stored in a secret vault and never Git.",
          "Domain / Registrar and outbound proxy.",
          "Allowed codecs.",
          "Capacity and concurrent call information.",
        ],
      },
      {
        id: "diagnostic",
        title: "G — If a test fails",
        intro: "First identify the failing layer.",
        items: [
          "401/403: check AK/AS/CK, API permissions, endpoint and server clock.",
          "Group not found: Billing Account is the group name, not the line number.",
          "Line not found: reuse exactly the Service Name shown or returned by OVHcloud.",
          "No user: create a Click2Call identity.",
          "Call rejected: check Caller ID, destination, line restrictions and billing/plan.",
          "If Caller ID is rejected, test the exact international Service Name format.",
        ],
      },
    ],
    mappingTitle: "3. VigiSensys field mapping",
    mappingIntro: "Each OVHcloud value maps to a specific field in the configuration.",
    mapping: [
      { field: "Endpoint", source: "Account zone", example: "ovh-eu" },
      { field: "Caller ID", source: "Allowed presented number", example: "line in international format" },
      { field: "Application Key", source: "OVHcloud API portal", example: "AK…", secret: true },
      { field: "Application Secret", source: "OVHcloud API portal", example: "AS…", secret: true },
      { field: "Consumer Key", source: "OVHcloud API portal", example: "CK…", secret: true },
      { field: "Billing account", source: "VoIP group name", example: "xx12345-ovh-1" },
      { field: "Service name / line", source: "OVHcloud SIP line", example: "0033…" },
      { field: "Click2Call user id", source: "Click2Call identity", example: "numeric ID" },
      { field: "Click2Call login", source: "Dedicated Click2Call account", example: "vigisensys_alarm", secret: true },
      { field: "Click2Call password", source: "Dedicated Click2Call account", example: "dedicated password", secret: true },
    ],
    firstCallTitle: "4. What the first real call must prove",
    firstCallItems: [
      "VigiSensys reaches the OVHcloud API.",
      "Keys and permissions are correct.",
      "Billing Account and Service Name target the right line.",
      "The Click2Call line rings as expected.",
      "The destination is called.",
      "The correct caller number is presented.",
      "Billing matches the selected offer.",
      "No secret appears in logs.",
    ],
    click2CallWarning:
      "Click2Call connects two parties. It does not yet let VigiSensys speak the alarm details itself.",
    asteriskTitle: "5. Why Asterisk comes next",
    asteriskBody:
      "For true automated voice alarms, VigiSensys must control the call, play audio, receive DTMF and track call state. Asterisk will own that telephony layer instead of VigiSensys reimplementing SIP/RTP.",
    asteriskItems: [
      "automatic calls without a human operator on the VigiSensys side",
      "audio file or TTS playback",
      "DTMF for replay or receipt confirmation",
      "retry and escalation scenarios",
      "ringing / answered / busy / no-answer / completed statuses",
      "future SIP Trunk support for multiple channels",
    ],
    securityTitle: "6. Security",
    securityItems: [
      "AS, CK, Click2Call password and future SIP password are secrets.",
      "Never put them in Git, a PR, screenshot or log.",
      "Use credentials dedicated to VigiSensys.",
      "Restrict API rights to the required scope.",
      "Immediately revoke a suspicious or exposed token.",
      "Telephony secrets are stored through the encrypted secret mechanism provided by VigiSensys.",
    ],
    checklistTitle: "Checklist before closing the guide",
    checklist: [
      "Click2Call-compatible offer confirmed",
      "Billing Account identified",
      "Service Name identified",
      "Caller ID identified",
      "AK / AS / CK generated",
      "GET/POST permissions limited to /telephony/* for the test",
      "Click2Call identity available",
      "VigiSensys configuration saved",
      "Connection test successful",
      "Test call successful",
      "SIP information securely retained for Asterisk",
    ],
    officialTitle: "Official OVHcloud documentation",
    officialBody:
      "These links are the source of truth for OVHcloud offers and menus. Use them if the interface differs from this guide.",
    officialLinks: {
      manager: "OVHcloud control panel",
      voipOffers: "OVHcloud VoIP offers",
      sipTrunk: "OVHcloud SIP Trunk",
      click2Call: "Click2Call guide",
      apiFirstSteps: "OVHcloud API guide",
      createToken: "Create AK / AS / CK",
    },
    closeHint: "You can reopen this guide at any time from the Telephony card.",
  },
}

export function TelephonyOvhSetupGuideDialog() {
  const locale = useLocale()
  const copy = COPY[locale === "en" ? "en" : "fr"]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          {copy.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
              {copy.brand}
            </Badge>
            <span className="text-xs text-muted-foreground">{copy.verified}</span>
          </div>
          <DialogTitle className="mt-2 text-xl sm:text-2xl">{copy.title}</DialogTitle>
          <DialogDescription className="max-w-3xl">{copy.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(92vh-150px)]">
          <div className="space-y-8 px-6 py-6">
            <section className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/25">
              <div className="flex items-start gap-3">
                <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-sky-700 dark:text-sky-300" />
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sky-950 dark:text-sky-100">{copy.recommendationTitle}</h3>
                    <p className="mt-1 text-sm leading-6 text-sky-950/80 dark:text-sky-100/80">{copy.recommendationBody}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sky-950 dark:text-sky-100">{copy.needsTitle}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {copy.needs.map((item) => (
                        <Badge key={item} variant="outline" className="bg-white/80 dark:bg-card/70">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{copy.offersTitle}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.offersIntro}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {copy.offers.map((offer) => (
                  <div key={offer.name} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold">{offer.name}</h4>
                      <Badge variant="secondary">{offer.badge}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{offer.description}</p>
                    <p className="mt-2 text-sm font-medium">{offer.recommendation}</p>
                  </div>
                ))}
              </div>
              <Notice text={copy.catalogWarning} />
              <div className="flex flex-wrap gap-2">
                <OfficialLink href={LINKS.voipOffers} label={copy.officialLinks.voipOffers} />
                <OfficialLink href={LINKS.sipTrunk} label={copy.officialLinks.sipTrunk} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">{copy.stepsTitle}</h3>
              <Accordion type="multiple" className="rounded-xl border px-4">
                {copy.steps.map((step) => (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger className="text-left">{step.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pb-2">
                        <p className="text-sm leading-6 text-muted-foreground">{step.intro}</p>
                        <GuideList items={step.items} />
                        {step.code ? (
                          <pre className="overflow-x-auto rounded-lg border bg-muted/60 p-3 text-xs"><code>{step.code}</code></pre>
                        ) : null}
                        {step.note ? <Notice text={step.note} /> : null}
                        {step.links?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {step.links.map((link) => (
                              <OfficialLink key={link} href={LINKS[link]} label={copy.officialLinks[link]} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{copy.mappingTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{copy.mappingIntro}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {copy.mapping.map((item) => (
                  <div key={item.field} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-2">
                      {item.secret ? <KeyRound className="h-4 w-4 text-amber-600" /> : <Server className="h-4 w-4 text-sky-600" />}
                      <p className="font-medium">{item.field}</p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{item.source}</p>
                    <code className="mt-2 block break-all rounded bg-muted px-2 py-1 text-xs">{item.example}</code>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-card p-4">
                <h3 className="font-semibold">{copy.firstCallTitle}</h3>
                <div className="mt-3"><GuideList items={copy.firstCallItems} /></div>
                <div className="mt-4"><Notice text={copy.click2CallWarning} /></div>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <h3 className="font-semibold">{copy.asteriskTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.asteriskBody}</p>
                <div className="mt-3"><GuideList items={copy.asteriskItems} accent="sky" /></div>
              </div>
            </section>

            <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                <div>
                  <h3 className="font-semibold text-emerald-950 dark:text-emerald-100">{copy.securityTitle}</h3>
                  <div className="mt-3"><GuideList items={copy.securityItems} /></div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">{copy.checklistTitle}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {copy.checklist.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border bg-muted/30 p-4">
              <h3 className="font-semibold">{copy.officialTitle}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.officialBody}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(LINKS) as LinkKey[]).map((key) => (
                  <OfficialLink key={key} href={LINKS[key]} label={copy.officialLinks[key]} />
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{copy.closeHint}</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function GuideList({ items, accent = "emerald" }: { items: string[]; accent?: "emerald" | "sky" }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${accent === "sky" ? "text-sky-600" : "text-emerald-600"}`} />
          <span className="leading-6">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Notice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-100">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  )
}

function OfficialLink({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="outline" size="sm" className="h-auto min-h-8 whitespace-normal text-left">
      <a href={href} target="_blank" rel="noreferrer">
        {label}
        <ExternalLink className="ml-2 h-3.5 w-3.5 shrink-0" />
      </a>
    </Button>
  )
}

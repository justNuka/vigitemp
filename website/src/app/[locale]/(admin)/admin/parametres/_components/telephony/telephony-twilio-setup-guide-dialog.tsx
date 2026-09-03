"use client"

import { useLocale } from "next-intl"
import { BookOpen, CheckCircle2, CircleAlert, ExternalLink, KeyRound, Network, PhoneCall, ShieldCheck } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const LINKS = {
  console: "https://console.twilio.com/",
  apiKeys: "https://www.twilio.com/docs/iam/api-keys/keys-in-console",
  restrictedKeys: "https://www.twilio.com/docs/iam/api-keys/restricted-api-keys",
  franceRegulatory: "https://www.twilio.com/en-us/guidelines/fr/regulatory",
  restConnectivity: "https://help.twilio.com/articles/360007130274-Requirements-for-Connecting-to-the-Twilio-REST-API-and-Troubleshooting-Common-Issues",
  callsApi: "https://www.twilio.com/docs/voice/api/call-resource",
  tts: "https://www.twilio.com/docs/voice/twiml/say/text-speech",
  trial: "https://www.twilio.com/docs/usage/trials/try-out-voice",
} as const

type LinkKey = keyof typeof LINKS

type GuideStep = {
  id: string
  title: string
  description: string
  items: string[]
  links?: LinkKey[]
}

type GuideCopy = {
  trigger: string
  title: string
  description: string
  badge: string
  verified: string
  recommendedTitle: string
  recommendedBody: string
  dsiTitle: string
  dsiIntro: string
  requiredLabel: string
  notRequiredLabel: string
  dsiRequired: string[]
  dsiNotRequired: string[]
  franceTitle: string
  franceBody: string
  franceItems: string[]
  setupTitle: string
  steps: GuideStep[]
  mappingTitle: string
  mapping: Array<{ field: string; source: string; secret?: boolean }>
  testTitle: string
  testItems: string[]
  securityTitle: string
  securityItems: string[]
  futureTitle: string
  futureBody: string
  checklistTitle: string
  checklist: string[]
  officialTitle: string
  officialLinks: Record<LinkKey, string>
}

const COPY: Record<"fr" | "en", GuideCopy> = {
  fr: {
    trigger: "Guide Twilio",
    title: "Configurer Twilio pour VigiSensys",
    description: "Mise en place du compte client, des prérequis DSI et du premier appel vocal VigiSensys.",
    badge: "Twilio V1",
    verified: "Informations vérifiées avec la documentation Twilio disponible au 02/09/2026. Les règles opérateur et réglementaires doivent être revérifiées avant chaque mise en production.",
    recommendedTitle: "Pourquoi Twilio est recommandé pour la V1",
    recommendedBody: "Le client possède son compte, son numéro et sa facturation Twilio. VigiSensys envoie uniquement des requêtes HTTPS sortantes à l'API Twilio. Aucun SIP, RTP, Asterisk, VM Linux, port entrant ou IP publique dédiée n'est nécessaire pour le premier niveau d'appels d'alarme.",
    dsiTitle: "Prérequis à transmettre au service informatique",
    dsiIntro: "Pour la V1, la VM Windows VigiSensys initie elle-même toutes les connexions vers Twilio. Cette liste peut être transmise à la DSI avant l'installation.",
    requiredLabel: "Requis",
    notRequiredLabel: "Non requis en V1",
    dsiRequired: [
      "Résolution DNS fonctionnelle de api.twilio.com depuis le serveur VigiSensys.",
      "HTTPS sortant TCP 443 vers api.twilio.com.",
      "TLS 1.2 ou TLS 1.3 et chaîne de certificats publics de confiance disponible sur le serveur.",
      "Firewall, antivirus et EDR autorisant le processus VigiSensys à ouvrir cette connexion HTTPS.",
      "Si un proxy HTTP(S) explicite ou authentifié est imposé, son fonctionnement avec le runtime VigiSensys doit être validé sur la VM réelle.",
      "Préférer une règle FQDN : les IP de la REST API Twilio sont dynamiques et ne doivent pas être figées dans une petite allowlist.",
      "Horloge Windows synchronisée, recommandée pour TLS, les logs et l'audit.",
    ],
    dsiNotRequired: [
      "Aucun port entrant depuis Internet.",
      "Aucune redirection NAT ou IP publique dédiée.",
      "Aucun SIP UDP 5060 ni plage RTP.",
      "Aucune VM Linux, Asterisk, FreePBX ou softphone.",
      "Aucun webhook public VigiSensys pour le premier appel TTS.",
    ],
    franceTitle: "France : choisir un numéro autorisé pour les appels automatisés",
    franceBody: "Un numéro français classique n'est pas automatiquement utilisable comme numéro émetteur d'un système d'appel automatisé. Le type de numéro et son usage réglementaire doivent être confirmés avec Twilio avant la production.",
    franceItems: [
      "Twilio indique actuellement que les numéros locaux +331 à +335, mobiles +336/+337 et +339 nationaux classiques ne sont pas destinés à Automated Outbound Calling.",
      "Le type Verified Polyvalent / NPV est documenté pour les appels automatisés ; les préfixes et disponibilités peuvent évoluer.",
      "Les justificatifs entreprise/KYC demandés par Twilio doivent être fournis par le client.",
      "Un compte Trial permet un PoC mais limite notamment les destinations aux numéros vérifiés et ne constitue pas une validation réglementaire de production.",
    ],
    setupTitle: "Mise en place étape par étape",
    steps: [
      {
        id: "account",
        title: "1 — Créer le compte Twilio du client",
        description: "Le compte de production doit appartenir au client final afin que le numéro, la facturation et les accès restent sous son contrôle.",
        items: [
          "Utiliser une adresse professionnelle contrôlée par le client.",
          "Activer la MFA et définir les administrateurs selon la politique interne.",
          "Un Trial peut servir au PoC ; pour la production, le client active son propre moyen de paiement.",
          "Configurer des alertes de consommation adaptées à la politique du client.",
        ],
        links: ["console", "trial"],
      },
      {
        id: "number",
        title: "2 — Commander le numéro Voice adapté",
        description: "Le numéro configuré dans VigiSensys sera le From des appels d'alarme.",
        items: [
          "Consulter les règles France Regulatory Guidelines au moment de la commande.",
          "Demander un numéro dont l'usage prescrit autorise explicitement Automated Outbound Calling ; privilégier Verified Polyvalent / NPV lorsque applicable.",
          "Finaliser les justificatifs KYC/réglementaires avant la mise en production.",
          "Conserver le numéro au format E.164, par exemple +33….",
        ],
        links: ["franceRegulatory"],
      },
      {
        id: "credentials",
        title: "3 — Créer une API Key dédiée à VigiSensys",
        description: "Une clé dédiée est préférable à l'Auth Token principal du compte.",
        items: [
          "Dans la Console Twilio, ouvrir API keys & tokens puis créer une clé nommée par exemple VigiSensys Voice.",
          "Pour le PoC, utiliser une Standard API Key dédiée afin de réduire les variables de diagnostic.",
          "Copier immédiatement le Secret : il n'est affiché qu'au moment de la création.",
          "Après validation, une Restricted API Key peut limiter l'accès aux opérations Calls en lecture et création lorsque la région/les fonctionnalités du compte le permettent.",
          "Ne jamais envoyer le Secret par email, capture, ticket, issue ou PR.",
        ],
        links: ["apiKeys", "restrictedKeys"],
      },
      {
        id: "network",
        title: "4 — Faire valider le réseau par la DSI",
        description: "Valider le chemin réseau avant de chercher une erreur dans les credentials Twilio.",
        items: [
          "Depuis le serveur VigiSensys, vérifier la résolution DNS de api.twilio.com.",
          "Vérifier TCP 443 sortant vers api.twilio.com.",
          "Vérifier le proxy et l'inspection TLS lorsqu'ils existent.",
          "Ne créer aucune règle entrante pour cette V1.",
        ],
        links: ["restConnectivity"],
      },
      {
        id: "config",
        title: "5 — Renseigner VigiSensys",
        description: "Administration → Paramètres → Téléphonie → Twilio.",
        items: [
          "Activer la téléphonie et sélectionner Twilio.",
          "Choisir API Key SID + Secret, méthode recommandée.",
          "Renseigner Account SID, API Key SID, API Key Secret et numéro Twilio émetteur.",
          "Cliquer sur Enregistrer avant les tests : les routes serveur relisent la configuration persistée.",
          "Les secrets utilisent le mécanisme de chiffrement téléphonie VigiSensys existant.",
        ],
      },
      {
        id: "test",
        title: "6 — Tester la connexion puis l'appel",
        description: "Les deux tests séparent volontairement authentification/réseau et création réelle d'un appel.",
        items: [
          "Tester la connexion : VigiSensys lit une page minimale de la collection Calls Twilio.",
          "Saisir un numéro destinataire maîtrisé au format E.164, par exemple +336….",
          "Tester l'appel : VigiSensys envoie du TwiML inline avec un message <Say language=\"fr-FR\">.",
          "Décrocher et vérifier que le message de test VigiSensys est entendu.",
          "Conserver le Call SID retourné pour le diagnostic dans les logs Voice Twilio.",
        ],
        links: ["callsApi", "tts"],
      },
    ],
    mappingTitle: "Correspondance des champs VigiSensys",
    mapping: [
      { field: "Account SID", source: "Identifiant du compte Twilio, préfixe AC" },
      { field: "API Key SID", source: "Clé dédiée VigiSensys, préfixe SK" },
      { field: "API Key Secret", source: "Secret affiché une seule fois lors de la création", secret: true },
      { field: "Auth Token", source: "Alternative conservée pour compatibilité/test, non recommandée par défaut", secret: true },
      { field: "Numéro Twilio émetteur", source: "Numéro Voice actif et autorisé pour l'usage automatisé, au format +…" },
    ],
    testTitle: "Ce que valide le PoC",
    testItems: [
      "HTTPS sortant depuis la VM Windows VigiSensys vers Twilio.",
      "Account SID et API Key valides.",
      "Numéro émetteur accepté par Twilio.",
      "Appel vers un téléphone réel.",
      "TTS français sans serveur public ni fichier audio externe.",
      "Retour d'un Call SID utilisable pour le futur historique/polling.",
    ],
    securityTitle: "Sécurité",
    securityItems: [
      "Un compte et une API Key par client.",
      "Le client conserve sa facturation Twilio.",
      "Préférer API Key à l'Auth Token principal.",
      "Révoquer immédiatement une clé exposée.",
      "Ne jamais stocker un Secret dans Git, un seed, un script partagé ou une capture.",
      "Limiter les permissions après le PoC lorsque le contexte Twilio le permet.",
    ],
    futureTitle: "Callbacks, DTMF et touche 1",
    futureBody: "Ils sont volontairement hors de cette V1. Le premier lot n'expose aucune URL client et ne nécessite aucun service MC2 public. Les statuts pourront d'abord être suivis par polling du Call SID. Une future version DTMF définira séparément le relais public éventuel, la validation X-Twilio-Signature, l'anti-replay et les règles d'acquittement/audit.",
    checklistTitle: "Checklist avant le premier test",
    checklist: [
      "Compte Twilio du client et MFA prêts.",
      "Trial compris ou compte de production activé.",
      "Numéro compatible avec l'usage automatisé confirmé.",
      "Account SID et API Key dédiée disponibles.",
      "HTTPS TCP 443 sortant vers api.twilio.com validé par la DSI.",
      "Aucun port entrant ouvert pour Twilio V1.",
      "Configuration enregistrée dans VigiSensys.",
      "Test connexion réussi puis appel/TTS réussi.",
    ],
    officialTitle: "Documentation officielle Twilio",
    officialLinks: {
      console: "Console Twilio",
      apiKeys: "Créer une API Key",
      restrictedKeys: "Restricted API Keys",
      franceRegulatory: "France Regulatory Guidelines",
      restConnectivity: "Prérequis réseau REST API",
      callsApi: "Programmable Voice — Calls API",
      tts: "Text-to-Speech / <Say>",
      trial: "Tester Voice avec un compte Trial",
    },
  },
  en: {
    trigger: "Twilio guide",
    title: "Configure Twilio for VigiSensys",
    description: "Set up the customer account, IT prerequisites and the first VigiSensys voice call.",
    badge: "Twilio V1",
    verified: "Checked against Twilio documentation available on 2026-09-02. Carrier and regulatory rules must be rechecked before each production rollout.",
    recommendedTitle: "Why Twilio is recommended for V1",
    recommendedBody: "The customer owns their Twilio account, number and billing. VigiSensys only sends outbound HTTPS requests to Twilio. No SIP, RTP, Asterisk, Linux VM, inbound port or dedicated public IP is required for the first alarm-call level.",
    dsiTitle: "Enterprise IT prerequisites",
    dsiIntro: "For V1, the Windows VigiSensys VM initiates every Twilio connection. This list can be sent directly to IT before installation.",
    requiredLabel: "Required",
    notRequiredLabel: "Not required in V1",
    dsiRequired: [
      "Working DNS resolution for api.twilio.com from the VigiSensys server.",
      "Outbound HTTPS TCP 443 to api.twilio.com.",
      "TLS 1.2 or TLS 1.3 with a trusted public certificate chain.",
      "Firewall, antivirus and EDR allowing the VigiSensys process to initiate this HTTPS connection.",
      "If an explicit/authenticated HTTPS proxy is mandatory, validate it with the actual VigiSensys runtime on the real VM.",
      "Prefer FQDN rules: Twilio REST API IP addresses are dynamic and should not be pinned to a small allowlist.",
      "Synchronized Windows system time is recommended for TLS, logs and audit.",
    ],
    dsiNotRequired: [
      "No inbound Internet port.",
      "No NAT forwarding or dedicated public IP.",
      "No SIP UDP 5060 or RTP range.",
      "No Linux VM, Asterisk, FreePBX or softphone.",
      "No public VigiSensys webhook for the first TTS call.",
    ],
    franceTitle: "France: choose a number authorized for automated calling",
    franceBody: "A regular French number is not automatically suitable as the caller number of an automated calling system. Confirm the number type and prescribed regulatory use with Twilio before production.",
    franceItems: [
      "Twilio currently states that regular +331 to +335 local, +336/+337 mobile and standard +339 national numbers are not intended for Automated Outbound Calling.",
      "Verified Polyvalent / NPV numbers are documented for automated calling; prefixes and availability can change.",
      "The customer must provide the business/KYC evidence requested by Twilio.",
      "A Trial can validate the PoC but restricts destinations to verified numbers and does not prove production regulatory compliance.",
    ],
    setupTitle: "Step-by-step setup",
    steps: [
      {
        id: "account",
        title: "1 — Create the customer's Twilio account",
        description: "The production account must belong to the final customer so they retain control of the number, billing and access.",
        items: [
          "Use a customer-controlled business email.",
          "Enable MFA and assign administrators according to customer policy.",
          "A Trial can be used for the PoC; production billing belongs directly to the customer.",
          "Configure usage/budget alerts that match customer policy.",
        ],
        links: ["console", "trial"],
      },
      {
        id: "number",
        title: "2 — Order the appropriate Voice number",
        description: "The configured number is the From used by VigiSensys alarm calls.",
        items: [
          "Review France Regulatory Guidelines when ordering.",
          "Choose a number whose prescribed use explicitly permits Automated Outbound Calling; use Verified Polyvalent / NPV where applicable.",
          "Complete business/KYC requirements before production.",
          "Keep the number in E.164 format, for example +33….",
        ],
        links: ["franceRegulatory"],
      },
      {
        id: "credentials",
        title: "3 — Create a dedicated VigiSensys API Key",
        description: "A dedicated key is preferred over the account's primary Auth Token.",
        items: [
          "In Twilio Console, open API keys & tokens and create a key such as VigiSensys Voice.",
          "Use a dedicated Standard API Key for the PoC to reduce diagnostic variables.",
          "Copy the Secret immediately; it is shown only at creation time.",
          "After validation, a Restricted API Key can limit Calls read/create operations when available for the account/region.",
          "Never send the Secret by email, screenshot, ticket, issue or PR.",
        ],
        links: ["apiKeys", "restrictedKeys"],
      },
      {
        id: "network",
        title: "4 — Have IT validate network access",
        description: "Validate the network path before troubleshooting Twilio credentials.",
        items: [
          "Resolve api.twilio.com from the VigiSensys server.",
          "Validate outbound TCP 443 to api.twilio.com.",
          "Validate proxy and TLS inspection when present.",
          "Do not create any inbound rule for V1.",
        ],
        links: ["restConnectivity"],
      },
      {
        id: "config",
        title: "5 — Configure VigiSensys",
        description: "Administration → Settings → Telephony → Twilio.",
        items: [
          "Enable telephony and select Twilio.",
          "Select API Key SID + Secret, the recommended method.",
          "Enter Account SID, API Key SID, API Key Secret and the Twilio From number.",
          "Save before testing because server routes reload persisted configuration.",
          "Secrets use the existing encrypted VigiSensys telephony storage.",
        ],
      },
      {
        id: "test",
        title: "6 — Test connection, then call",
        description: "The two tests intentionally separate network/authentication from a real call.",
        items: [
          "Test connection reads a minimal page of the Twilio Calls collection.",
          "Enter a controlled E.164 destination such as +336….",
          "Test call sends inline TwiML with a <Say language=\"fr-FR\"> message.",
          "Answer and verify the VigiSensys test message is spoken.",
          "Keep the returned Call SID for Twilio Voice log diagnostics.",
        ],
        links: ["callsApi", "tts"],
      },
    ],
    mappingTitle: "VigiSensys field mapping",
    mapping: [
      { field: "Account SID", source: "Twilio account identifier, AC prefix" },
      { field: "API Key SID", source: "Dedicated VigiSensys key, SK prefix" },
      { field: "API Key Secret", source: "Secret shown once when the key is created", secret: true },
      { field: "Auth Token", source: "Compatibility/test alternative, not recommended by default", secret: true },
      { field: "Twilio caller number", source: "Active Voice number authorized for automated use, in + format" },
    ],
    testTitle: "What the PoC proves",
    testItems: [
      "Outbound HTTPS from the Windows VigiSensys VM to Twilio.",
      "Valid Account SID and API Key.",
      "Twilio accepts the caller number.",
      "A real phone can be called.",
      "French TTS works without a public server or external audio file.",
      "A Call SID is returned for future history/polling.",
    ],
    securityTitle: "Security",
    securityItems: [
      "One customer account and API Key per installation/customer.",
      "The customer retains Twilio billing.",
      "Prefer API Keys over the primary Auth Token.",
      "Immediately revoke an exposed key.",
      "Never store a Secret in Git, seeds, shared scripts or screenshots.",
      "Limit permissions after the PoC when supported by the Twilio context.",
    ],
    futureTitle: "Callbacks, DTMF and press 1",
    futureBody: "They are intentionally outside V1. The first lot exposes no customer URL and needs no public MC2 service. Call status can first be polled using the Call SID. A future DTMF release will separately define any public relay, X-Twilio-Signature validation, replay protection and acknowledgement/audit rules.",
    checklistTitle: "Checklist before the first test",
    checklist: [
      "Customer Twilio account and MFA ready.",
      "Trial limitations understood or production account enabled.",
      "Number compatible with automated calling confirmed.",
      "Account SID and dedicated API Key available.",
      "Outbound HTTPS TCP 443 to api.twilio.com approved by IT.",
      "No inbound port opened for Twilio V1.",
      "Configuration saved in VigiSensys.",
      "Connection test succeeds, then call/TTS succeeds.",
    ],
    officialTitle: "Official Twilio documentation",
    officialLinks: {
      console: "Twilio Console",
      apiKeys: "Create an API Key",
      restrictedKeys: "Restricted API Keys",
      franceRegulatory: "France Regulatory Guidelines",
      restConnectivity: "REST API network requirements",
      callsApi: "Programmable Voice Calls API",
      tts: "Text-to-Speech / <Say>",
      trial: "Test Voice with a Trial account",
    },
  },
}

function GuideLink({ linkKey, label }: { linkKey: LinkKey; label: string }) {
  return (
    <Button asChild size="sm" variant="outline">
      <a href={LINKS[linkKey]} target="_blank" rel="noreferrer">
        {label}
        <ExternalLink className="ml-2 h-3.5 w-3.5" />
      </a>
    </Button>
  )
}

function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

export function TelephonyTwilioSetupGuideDialog() {
  const locale = useLocale()
  const copy = COPY[locale === "en" ? "en" : "fr"]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <BookOpen className="mr-2 h-4 w-4" />
          {copy.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{copy.title}</DialogTitle>
            <Badge variant="secondary">{copy.badge}</Badge>
          </div>
          <DialogDescription>{copy.description}</DialogDescription>
          <p className="text-xs text-muted-foreground">{copy.verified}</p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(92vh-135px)]">
          <div className="space-y-6 p-6">
            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-emerald-950 dark:text-emerald-100">
                <PhoneCall className="h-5 w-5" />
                {copy.recommendedTitle}
              </h3>
              <p className="text-sm text-emerald-950/80 dark:text-emerald-100/80">{copy.recommendedBody}</p>
            </section>

            <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-sky-950 dark:text-sky-100">
                <Network className="h-5 w-5" />
                {copy.dsiTitle}
              </h3>
              <p className="mb-4 text-sm text-sky-950/80 dark:text-sky-100/80">{copy.dsiIntro}</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg bg-white/70 p-3 dark:bg-background/40">
                  <p className="mb-2 text-sm font-semibold">{copy.requiredLabel}</p>
                  <ItemList items={copy.dsiRequired} />
                </div>
                <div className="rounded-lg bg-white/70 p-3 dark:bg-background/40">
                  <p className="mb-2 text-sm font-semibold">{copy.notRequiredLabel}</p>
                  <ItemList items={copy.dsiNotRequired} />
                </div>
              </div>
              <div className="mt-3">
                <GuideLink linkKey="restConnectivity" label={copy.officialLinks.restConnectivity} />
              </div>
            </section>

            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-100">
                <CircleAlert className="h-5 w-5" />
                {copy.franceTitle}
              </h3>
              <p className="mb-3 text-sm font-medium text-amber-950/85 dark:text-amber-100/85">{copy.franceBody}</p>
              <ItemList items={copy.franceItems} />
              <div className="mt-3">
                <GuideLink linkKey="franceRegulatory" label={copy.officialLinks.franceRegulatory} />
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-semibold">{copy.setupTitle}</h3>
              <Accordion type="single" collapsible className="rounded-xl border px-4">
                {copy.steps.map((step) => (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger className="text-left">{step.title}</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <ItemList items={step.items} />
                      {step.links?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {step.links.map((linkKey) => (
                            <GuideLink key={linkKey} linkKey={linkKey} label={copy.officialLinks[linkKey]} />
                          ))}
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <KeyRound className="h-5 w-5" />
                {copy.mappingTitle}
              </h3>
              <div className="overflow-hidden rounded-xl border">
                <div className="divide-y">
                  {copy.mapping.map((row) => (
                    <div key={row.field} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[190px_1fr]">
                      <div className="font-medium">{row.field}{row.secret ? " 🔒" : ""}</div>
                      <div className="text-muted-foreground">{row.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border p-4">
                <h3 className="mb-3 font-semibold">{copy.testTitle}</h3>
                <ItemList items={copy.testItems} />
              </div>
              <div className="rounded-xl border p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-5 w-5" />
                  {copy.securityTitle}
                </h3>
                <ItemList items={copy.securityItems} />
              </div>
            </section>

            <section className="rounded-xl border p-4">
              <h3 className="mb-2 font-semibold">{copy.futureTitle}</h3>
              <p className="text-sm text-muted-foreground">{copy.futureBody}</p>
            </section>

            <section>
              <h3 className="mb-3 font-semibold">{copy.checklistTitle}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {copy.checklist.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-lg border p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-semibold">{copy.officialTitle}</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LINKS) as LinkKey[]).map((linkKey) => (
                  <GuideLink key={linkKey} linkKey={linkKey} label={copy.officialLinks[linkKey]} />
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

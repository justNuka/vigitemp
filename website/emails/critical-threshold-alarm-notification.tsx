import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Locale = "fr" | "en";
type CriticalDirection = "high" | "low";

type CriticalThresholdAlarmEmailProps = {
  locale?: Locale;
  site?: string;
  lieu: string;
  sonde?: string;
  alarmType: string;
  triggeredAt?: string;
  measuredValue?: string;
  criticalThreshold: string;
  direction: CriticalDirection;
  details?: string;
  alarmUrl?: string;
  chartSrc?: string;
};

const COPY = {
  fr: {
    preview: "SEUIL CRITIQUE DEPASSE",
    title: "Seuil critique dépassé",
    subtitle: "Déclenchement immédiat d'une alarme VigiSensys",
    site: "Site",
    lieu: "Lieu",
    sonde: "Sonde",
    type: "Type",
    triggeredAt: "Date de déclenchement",
    measuredValue: "Valeur mesurée",
    highThreshold: "Seuil critique haut",
    lowThreshold: "Seuil critique bas",
    details: "Détails",
    chart: "Courbe (extrait)",
    openAlarmPage: "Ouvrir la page des alarmes",
    fallbackLink: "Si le bouton ne fonctionne pas, utilisez ce lien :",
    noReply: "Email automatique - merci de ne pas y répondre.",
    brand: "Système de surveillance environnementale",
  },
  en: {
    preview: "CRITICAL THRESHOLD EXCEEDED",
    title: "Critical threshold exceeded",
    subtitle: "Immediate VigiSensys alarm trigger",
    site: "Site",
    lieu: "Location",
    sonde: "Sensor",
    type: "Type",
    triggeredAt: "Triggered at",
    measuredValue: "Measured value",
    highThreshold: "High critical threshold",
    lowThreshold: "Low critical threshold",
    details: "Details",
    chart: "Chart (snapshot)",
    openAlarmPage: "Open alarms page",
    fallbackLink: "If the button does not work, use this link:",
    noReply: "This email was sent automatically. Please do not reply.",
    brand: "Environmental monitoring system",
  },
} as const;

export default function CriticalThresholdAlarmNotificationEmail({
  locale = "fr",
  site,
  lieu,
  sonde,
  alarmType,
  triggeredAt,
  measuredValue,
  criticalThreshold,
  direction,
  details,
  alarmUrl,
  chartSrc,
}: CriticalThresholdAlarmEmailProps) {
  const lang: Locale = locale === "en" ? "en" : "fr";
  const copy = COPY[lang];
  const thresholdLabel = direction === "high" ? copy.highThreshold : copy.lowThreshold;

  return (
    <Html>
      <Head />
      <Preview>{`[VIGISENSYS] ${copy.preview} - ${lieu}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.kicker}>VIGISENSYS · CRITICAL</Text>
            <Heading style={styles.headerTitle}>{copy.title}</Heading>
            <Text style={styles.headerSubtitle}>{copy.subtitle}</Text>
          </Section>

          <Section style={styles.content}>
            <Section style={styles.criticalCard}>
              <Text style={styles.criticalLabel}>{thresholdLabel}</Text>
              <Text style={styles.criticalValue}>{criticalThreshold}</Text>
              {measuredValue ? (
                <Text style={styles.measuredValue}>
                  <strong>{copy.measuredValue}:</strong> {measuredValue}
                </Text>
              ) : null}
            </Section>

            <Section style={styles.infoCard}>
              <Text style={styles.infoRow}><strong>{copy.site}:</strong> {site || "-"}</Text>
              <Text style={styles.infoRow}><strong>{copy.lieu}:</strong> {lieu}</Text>
              <Text style={styles.infoRow}><strong>{copy.sonde}:</strong> {sonde || "-"}</Text>
              <Text style={styles.infoRow}><strong>{copy.type}:</strong> {alarmType}</Text>
              {triggeredAt ? (
                <Text style={{ ...styles.infoRow, marginBottom: 0 }}>
                  <strong>{copy.triggeredAt}:</strong> {triggeredAt}
                </Text>
              ) : null}
            </Section>

            {details ? (
              <Section style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>{copy.details}</Text>
                <Text style={styles.detailsText}>{details}</Text>
              </Section>
            ) : null}

            {chartSrc ? (
              <Section style={styles.chartCard}>
                <Text style={styles.detailsTitle}>{copy.chart}</Text>
                <Img src={chartSrc} alt="Critical alarm chart" width="560" style={styles.chartImg} />
              </Section>
            ) : null}

            {alarmUrl ? (
              <Section style={{ textAlign: "center", marginTop: "16px" }}>
                <Button href={alarmUrl} style={styles.button}>
                  {copy.openAlarmPage}
                </Button>
              </Section>
            ) : null}

            {alarmUrl ? (
              <Section style={styles.linkBlock}>
                <Text style={styles.linkHint}>{copy.fallbackLink}</Text>
                <Link href={alarmUrl} style={styles.link}>{alarmUrl}</Link>
              </Section>
            ) : null}

            <Hr style={styles.hr} />
            <Text style={styles.footerText}>{copy.noReply}</Text>
          </Section>

          <Section style={styles.footerBand}>
            <Text style={styles.footerBrand}>
              <strong>VigiSensys</strong> - {copy.brand}
              <br />
              <Link href="https://www.mc2lab.fr" style={styles.footerLink}>MC2 Lab</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f8fafc",
    fontFamily: "Arial, sans-serif",
    margin: "0",
    padding: "24px 8px",
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#450a0a",
    borderTop: "5px solid #ef4444",
    padding: "18px 20px",
  },
  kicker: {
    color: "#fca5a5",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.2px",
    margin: "0 0 6px 0",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "22px",
    margin: 0,
  },
  headerSubtitle: {
    color: "#fecaca",
    fontSize: "13px",
    margin: "8px 0 0 0",
  },
  content: {
    padding: "18px 20px",
  },
  criticalCard: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    padding: "14px 16px",
    textAlign: "center" as const,
  },
  criticalLabel: {
    color: "#991b1b",
    fontSize: "12px",
    fontWeight: "700",
    margin: "0 0 5px 0",
    textTransform: "uppercase" as const,
  },
  criticalValue: {
    color: "#7f1d1d",
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
  },
  measuredValue: {
    color: "#991b1b",
    fontSize: "14px",
    margin: "8px 0 0 0",
  },
  infoCard: {
    marginTop: "12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "10px 12px",
  },
  infoRow: {
    margin: "0 0 6px 0",
    color: "#374151",
    fontSize: "13px",
  },
  detailsCard: {
    marginTop: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    padding: "10px 12px",
  },
  detailsTitle: {
    margin: "0 0 6px 0",
    color: "#374151",
    fontSize: "12px",
    fontWeight: "700",
  },
  detailsText: {
    margin: 0,
    color: "#111827",
    fontSize: "13px",
    lineHeight: "1.45",
  },
  chartCard: {
    marginTop: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    padding: "10px 12px",
  },
  chartImg: {
    width: "100%",
    maxWidth: "560px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  button: {
    backgroundColor: "#b91c1c",
    color: "#ffffff",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "700",
    textDecoration: "none",
    display: "inline-block",
  },
  linkBlock: {
    marginTop: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    padding: "10px 12px",
  },
  linkHint: {
    margin: "0 0 6px 0",
    color: "#6b7280",
    fontSize: "12px",
  },
  link: {
    color: "#b91c1c",
    fontSize: "12px",
    wordBreak: "break-all" as const,
    textDecoration: "none",
  },
  hr: {
    borderColor: "#e5e7eb",
    margin: "16px 0 10px",
  },
  footerText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "11px",
    textAlign: "center" as const,
  },
  footerBand: {
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #e9ecef",
    padding: "12px 20px",
    textAlign: "center" as const,
  },
  footerBrand: {
    margin: 0,
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: "1.45",
  },
  footerLink: {
    color: "#b91c1c",
    textDecoration: "none",
  },
};

CriticalThresholdAlarmNotificationEmail.PreviewProps = {
  locale: "fr",
  site: "AUBIERE",
  lieu: "Chambre froide 01",
  sonde: "SPNB-26000059",
  alarmType: "ALARME HAUTE",
  triggeredAt: "24/09/2026 13:08:15",
  measuredValue: "12,80°C",
  criticalThreshold: "10,00°C",
  direction: "high",
  details: "Le seuil critique haut a été dépassé.",
  alarmUrl: "http://127.0.0.1:3000/fr/alarmes",
} as CriticalThresholdAlarmEmailProps;

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

type AlarmEventEmailProps = {
  eventType: "triggered" | "ended" | "acknowledged";
  site?: string;
  lieu: string;
  sonde?: string;
  alarmType: string;
  triggeredAt?: string;
  endedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  lastValue?: string;
  details?: string;
  alarmUrl?: string;
  chartSrc?: string;
};

const EVENT_LABEL: Record<AlarmEventEmailProps["eventType"], string> = {
  triggered: "ALARME DÉCLENCHÉE",
  ended: "ALARME TERMINÉE",
  acknowledged: "ALARME ACQUITTÉE",
};

const EVENT_COLOR: Record<AlarmEventEmailProps["eventType"], string> = {
  triggered: "#dc2626",
  ended: "#7c3aed",
  acknowledged: "#0284c7",
};

export default function AlarmEventNotificationEmail({
  eventType,
  site,
  lieu,
  sonde,
  alarmType,
  triggeredAt,
  endedAt,
  acknowledgedAt,
  acknowledgedBy,
  lastValue,
  details,
  alarmUrl,
  chartSrc,
}: AlarmEventEmailProps) {
  const eventLabel = EVENT_LABEL[eventType];
  const accent = EVENT_COLOR[eventType];

  return (
    <Html>
      <Head />
      <Preview>{`[VIGITEMP] ${eventLabel} - ${lieu}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={{ ...styles.header, borderTop: `4px solid ${accent}` }}>
            <Text style={styles.kicker}>VIGITEMP</Text>
            <Heading style={styles.headerTitle}>Notification d'alarme Vigitemp</Heading>
            <Text style={{ ...styles.headerSubtitle, color: accent }}>{eventLabel}</Text>
          </Section>

          <Section style={styles.content}>
            <Section style={styles.infoCard}>
              <Text style={styles.infoRow}><strong>Site:</strong> {site || "-"}</Text>
              <Text style={styles.infoRow}><strong>Lieu:</strong> {lieu}</Text>
              <Text style={styles.infoRow}><strong>Sonde:</strong> {sonde || "-"}</Text>
              <Text style={styles.infoRow}><strong>Type:</strong> {alarmType}</Text>
              {triggeredAt ? <Text style={styles.infoRow}><strong>Date déclenchement:</strong> {triggeredAt}</Text> : null}
              {endedAt ? <Text style={styles.infoRow}><strong>Date fin:</strong> {endedAt}</Text> : null}
              {acknowledgedAt ? <Text style={styles.infoRow}><strong>Date acquittement:</strong> {acknowledgedAt}</Text> : null}
              {acknowledgedBy ? <Text style={styles.infoRow}><strong>Acquittée par:</strong> {acknowledgedBy}</Text> : null}
              {lastValue ? <Text style={{ ...styles.infoRow, marginBottom: 0 }}><strong>Dernière valeur:</strong> {lastValue}</Text> : null}
            </Section>

            {details ? (
              <Section style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Détails</Text>
                <Text style={styles.detailsText}>{details}</Text>
              </Section>
            ) : null}

            {chartSrc ? (
              <Section style={styles.chartCard}>
                <Text style={styles.detailsTitle}>Courbe (extrait)</Text>
                <Img src={chartSrc} alt="Extrait courbe alarme" width="560" style={styles.chartImg} />
              </Section>
            ) : null}

            {alarmUrl ? (
              <Section style={{ textAlign: "center", marginTop: "16px" }}>
                <Button href={alarmUrl} style={{ ...styles.button, backgroundColor: accent }}>
                  Ouvrir la page des alarmes
                </Button>
              </Section>
            ) : null}

            {alarmUrl ? (
              <Section style={styles.linkBlock}>
                <Text style={styles.linkHint}>
                  Si le bouton ne fonctionne pas, utilisez ce lien:
                </Text>
                <Link href={alarmUrl} style={styles.link}>
                  {alarmUrl}
                </Link>
              </Section>
            ) : null}

            <Hr style={styles.hr} />
            <Text style={styles.footerText}>Email automatique - merci de ne pas y repondre.</Text>
          </Section>

          <Section style={styles.footerBand}>
            <Text style={styles.footerBrand}>
              <strong>Vigitemp</strong> - Systeme de surveillance environnementale
              <br />
              <Link href="https://www.mc2lab.fr" style={styles.footerLink}>
                MC2 Lab
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
    margin: "0",
    padding: "24px 8px",
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#0f172a",
    padding: "16px 20px",
  },
  kicker: {
    color: "#93c5fd",
    fontSize: "11px",
    letterSpacing: "1.1px",
    margin: "0 0 6px 0",
    textTransform: "uppercase" as const,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "20px",
    margin: 0,
  },
  headerSubtitle: {
    fontSize: "13px",
    fontWeight: "700",
    margin: "8px 0 0 0",
  },
  content: {
    padding: "18px 20px",
  },
  infoCard: {
    marginTop: "0",
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
    color: "#0284c7",
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
    color: "#0284c7",
    textDecoration: "none",
  },
};

AlarmEventNotificationEmail.PreviewProps = {
  eventType: "triggered",
  site: "AUBIÈRE",
  lieu: "TEST_GSO-RDC",
  sonde: "10007203",
  alarmType: "ALARME HAUTE",
  triggeredAt: "20/02/2026 11:30:00",
  lastValue: "23.4C",
  details: "Seuil maximal depassé. Tolérance sup: 22C / Consigne: 20C / Tolérance inf: 18C",
  alarmUrl: "http://127.0.0.1:3000/fr/alarmes",
  chartSrc: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc2NDAnIGhlaWdodD0nMjQwJyB2aWV3Qm94PScwIDAgNjQwIDI0MCc+PHJlY3Qgd2lkdGg9JzY0MCcgaGVpZ2h0PScyNDAnIGZpbGw9JyNmZmZmZmYnLz48cmVjdCB4PScyNCcgeT0nMTYnIHdpZHRoPSc1OTInIGhlaWdodD0nMTk2JyBmaWxsPScjZjhmYWZjJyBzdHJva2U9JyNjYmQ1ZTEnLz48bGluZSB4MT0nMjQnIHkxPSc3MCcgeDI9JzYxNicgeTI9JzcwJyBzdHJva2U9JyNkYzI2MjYnIHN0cm9rZS1kYXNoYXJyYXk9JzYgNCcvPjxsaW5lIHgxPScyNCcgeTE9JzEyMCcgeDI9JzYxNicgeTI9JzEyMCcgc3Ryb2tlPScjMTExODI3Jy8+PGxpbmUgeDE9JzI0JyB5MT0nMTcwJyB4Mj0nNjE2JyB5Mj0nMTcwJyBzdHJva2U9JyNkYzI2MjYnIHN0cm9rZS1kYXNoYXJyYXk9JzYgNCcvPjxwYXRoIGQ9J00zMCAxNTAgTDkwIDE0NSBMMTUwIDEzNSBMMjEwIDk1IEwyNzAgODAgTDMzMCA4OCBMMzkwIDExMCBMNDUwIDEzMCBMNTEwIDE2MCBMNTcwIDE0MCBMNjEwIDEwMCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjM2I4MmY2JyBzdHJva2Utd2lkdGg9JzIuNScvPjx0ZXh0IHg9JzYxMCcgeT0nNjYnIHRleHQtYW5jaG9yPSdlbmQnIGZvbnQtc2l6ZT0nMTEnIGZpbGw9JyNkYzI2MjYnPk1heDogMjJDPC90ZXh0Pjx0ZXh0IHg9JzYxMCcgeT0nMTE2JyB0ZXh0LWFuY2hvcj0nZW5kJyBmb250LXNpemU9JzExJyBmaWxsPScjMTExODI3Jz5Db25zaWduZTogMjBDPC90ZXh0Pjx0ZXh0IHg9JzYxMCcgeT0nMTY2JyB0ZXh0LWFuY2hvcj0nZW5kJyBmb250LXNpemU9JzExJyBmaWxsPScjZGMyNjI2Jz5NaW46IDE4QzwvdGV4dD48L3N2Zz4=",
} as AlarmEventEmailProps;

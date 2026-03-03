import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type AlarmNotificationEmailProps = {
  title?: string;
  message?: string;
  location?: string;
  timestamp?: string;
  alarmUrl?: string;
};

export default function AlarmNotificationEmail({
  title = "ALARME EN COURS",
  message = "Une alarme a ete detectee sur un lieu de surveillance.",
  location = "SITE / LIEU",
  timestamp = "20/02/2026 10:42:00",
  alarmUrl,
}: AlarmNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`[VIGITEMP] ${title}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.kicker}>VIGITEMP</Text>
            <Heading style={styles.headerTitle}>Notification d'alarme Vigitemp</Heading>
          </Section>

          <Section style={styles.content}>
            <Section style={styles.alertCard}>
              <Text style={styles.alertTitle}>{title}</Text>
              <Text style={styles.alertMessage}>{message}</Text>
            </Section>

            <Section style={styles.infoCard}>
              <Text style={styles.infoRow}>
                <strong>Lieu:</strong> {location}
              </Text>
              <Text style={{ ...styles.infoRow, marginBottom: 0 }}>
                <strong>Date:</strong> {timestamp}
              </Text>
            </Section>

            {alarmUrl ? (
              <Section style={{ textAlign: "center", marginTop: "16px" }}>
                <Button href={alarmUrl} style={styles.button}>
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
            <Text style={styles.footerText}>
              Email automatique - merci de ne pas y repondre.
            </Text>
          </Section>

          <Section style={styles.footerBand}>
            <Text style={styles.footerBrand}>
              <strong>VigiSensys</strong> - Système de surveillance environnementale
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
  content: {
    padding: "18px 20px",
  },
  alertCard: {
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "8px",
    padding: "12px 14px",
  },
  alertTitle: {
    margin: "0 0 6px 0",
    color: "#9f1239",
    fontWeight: "700",
    fontSize: "15px",
  },
  alertMessage: {
    margin: 0,
    color: "#111827",
    fontSize: "14px",
    lineHeight: "1.45",
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
  button: {
    backgroundColor: "#0284c7",
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

AlarmNotificationEmail.PreviewProps = {
  title: "ALARME HAUTE",
  message: "Le seuil maximal a ete depasse sur le lieu teste.",
  location: "AUBIERE / TEST_GSO-RDC / 10007203",
  timestamp: "20/02/2026 10:42:00",
  alarmUrl: "http://127.0.0.1:3000/fr/alarmes",
} as AlarmNotificationEmailProps;

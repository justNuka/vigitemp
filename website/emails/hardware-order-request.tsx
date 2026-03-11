import * as React from "react"
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type HardwareOrderRequestEmailProps = {
  reference: string
  requesterName: string
  requesterEmail: string
  comment?: string | null
  items: Array<{
    refCommercial: string
    designation: string
    gamme: string
    type: string
    quantity: number
  }>
}

export default function HardwareOrderRequestEmail({
  reference,
  requesterName,
  requesterEmail,
  comment,
  items,
}: HardwareOrderRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Demande de devis matériel ${reference}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Demande de devis matériel {reference}</Heading>
          <Text style={paragraph}>Une nouvelle demande de devis matériel a ete envoyee depuis VigiSensys.</Text>

          <Section style={card}>
            <Text style={label}>Demandeur</Text>
            <Text style={value}>{requesterName}</Text>
            <Text style={label}>Email</Text>
            <Text style={value}>{requesterEmail}</Text>
          </Section>

          <Section style={card}>
            <Text style={label}>Matériels</Text>
            {items.map((item) => (
              <Section key={`${item.refCommercial}-${item.designation}`} style={itemRow}>
                <Text style={itemTitle}>
                  {item.designation} ({item.refCommercial})
                </Text>
                <Text style={itemMeta}>
                  {item.gamme} · {item.type} · Quantité : {item.quantity}
                </Text>
              </Section>
            ))}
          </Section>

          {comment?.trim() ? (
            <Section style={card}>
              <Text style={label}>Commentaire</Text>
              <Text style={value}>{comment.trim()}</Text>
            </Section>
          ) : null}

          <Hr style={divider} />
          <Text style={footer}>Le PDF récapitulatif est joint a ce message.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: "#f8fafc",
  fontFamily: "Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
}

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "640px",
  padding: "32px",
}

const heading = {
  color: "#0f172a",
  fontSize: "24px",
  margin: "0 0 16px",
}

const paragraph = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
}

const card = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  marginBottom: "16px",
  padding: "16px",
}

const label = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "bold" as const,
  letterSpacing: "0.04em",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
}

const value = {
  color: "#0f172a",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px",
}

const itemRow = {
  borderTop: "1px solid #e2e8f0",
  marginTop: "12px",
  paddingTop: "12px",
}

const itemTitle = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: "bold" as const,
  margin: "0 0 4px",
}

const itemMeta = {
  color: "#475569",
  fontSize: "13px",
  margin: 0,
}

const divider = {
  borderColor: "#e2e8f0",
  margin: "24px 0 16px",
}

const footer = {
  color: "#64748b",
  fontSize: "12px",
  margin: 0,
}

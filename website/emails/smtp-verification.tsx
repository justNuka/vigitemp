import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

type Locale = "fr" | "en"

type SmtpVerificationEmailProps = {
  code: string
  expiresInMinutes: number
  locale?: Locale
}

const COPY: Record<
  Locale,
  {
    preview: string
    title: string
    intro: string
    expiry: string
    ignore: string
    brand: string
  }
> = {
  fr: {
    preview: "Code de validation SMTP VigiSensys",
    title: "Validation de la configuration SMTP",
    intro:
      "Une modification de la configuration SMTP VigiSensys vient d'être enregistrée. Saisissez le code ci-dessous dans l'application pour confirmer que cette configuration peut réellement envoyer des emails.",
    expiry: "Ce code est valable pendant {minutes} minutes.",
    ignore:
      "Si vous n'êtes pas à l'origine de ce test, vous pouvez ignorer cet email.",
    brand: "Système de surveillance environnementale",
  },
  en: {
    preview: "VigiSensys SMTP verification code",
    title: "SMTP configuration verification",
    intro:
      "A VigiSensys SMTP configuration change was just saved. Enter the code below in the application to confirm that this configuration can actually send email.",
    expiry: "This code is valid for {minutes} minutes.",
    ignore: "If you did not request this test, you can ignore this email.",
    brand: "Environmental monitoring system",
  },
}

export function SmtpVerificationEmail({
  code,
  expiresInMinutes,
  locale = "fr",
}: SmtpVerificationEmailProps) {
  const lang: Locale = locale === "en" ? "en" : "fr"
  const copy = COPY[lang]

  return (
    <Html>
      <Preview>{copy.preview}</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="mx-auto my-16 max-w-[600px] rounded-lg bg-white shadow-lg">
            <Section className="rounded-t-lg bg-[#0f172a] p-8">
              <Heading className="m-0 text-center text-[26px] font-bold text-white">
                {copy.title}
              </Heading>
            </Section>

            <Section className="px-10 py-8">
              <Text className="mb-6 text-[16px] leading-7 text-[#334155]">
                {copy.intro}
              </Text>

              <Section className="my-8 rounded-xl border border-solid border-[#cbd5e1] bg-[#f8fafc] px-6 py-7 text-center">
                <Text className="m-0 font-mono text-[36px] font-bold tracking-[0.35em] text-[#0f172a]">
                  {code}
                </Text>
              </Section>

              <Text className="mb-2 text-[14px] text-[#64748b]">
                {copy.expiry.replace("{minutes}", String(expiresInMinutes))}
              </Text>
              <Text className="m-0 text-[13px] text-[#94a3b8]">
                {copy.ignore}
              </Text>
            </Section>

            <Section className="rounded-b-lg border-t border-solid border-[#e2e8f0] bg-[#f8fafc] px-10 py-5 text-center">
              <Text className="m-0 text-[12px] text-[#64748b]">
                <strong>VigiSensys</strong> — {copy.brand}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default SmtpVerificationEmail

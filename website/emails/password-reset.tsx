import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type Locale = 'fr' | 'en';

interface PasswordResetEmailProps {
  resetUrl: string;
  firstName?: string;
  lastName?: string;
  expiresIn: string;
  locale?: Locale;
}

const COPY: Record<Locale, Record<string, string>> = {
  fr: {
    preview: 'Réinitialisation de votre mot de passe Vigitemp',
    title: 'Réinitialisation de mot de passe',
    hello: 'Bonjour',
    fallbackUser: 'utilisateur',
    intro:
      'Vous avez demande la reinitialisation de votre mot de passe Vigitemp. Cliquez sur le bouton ci-dessous pour creer un nouveau mot de passe :',
    cta: 'Réinitialiser mon mot de passe',
    fallbackLink: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :',
    warning:
      'Important : Ce lien est valide pendant {expiresIn}. Si vous n\'avez pas demande cette reinitialisation, ignorez cet email - votre mot de passe reste inchange.',
    security: 'Pour votre sécurité, ne partagez jamais ce lien avec quiconque.',
    noreply: 'Cet email à été envoyé automatiquement, merci de ne pas y répondre.',
    brand: 'Système de surveillance environnementale',
  },
  en: {
    preview: 'Reset your Vigitemp password',
    title: 'Password reset',
    hello: 'Hello',
    fallbackUser: 'user',
    intro:
      'You requested a Vigitemp password reset. Click the button below to create a new password:',
    cta: 'Reset my password',
    fallbackLink: 'If the button does not work, copy and paste this link into your browser:',
    warning:
      'Important: This link is valid for {expiresIn}. If you did not request this reset, ignore this email - your password remains unchanged.',
    security: 'For your security, never share this link with anyone.',
    noreply: 'This email was sent automatically, please do not reply.',
    brand: 'Environmental monitoring system',
  },
};

export const PasswordResetEmail = ({
  resetUrl,
  firstName,
  lastName,
  expiresIn = '1 hour',
  locale = 'fr',
}: PasswordResetEmailProps) => {
  const lang: Locale = locale === 'en' ? 'en' : 'fr';
  const c = COPY[lang];
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : c.fallbackUser;
  const warning = c.warning.replace('{expiresIn}', expiresIn);

  return (
    <Html>
      <Preview>{c.preview}</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto my-16 p-0 max-w-150 rounded-lg shadow-lg">
            <Section className="bg-linear-to-r from-orange-600 to-orange-700 rounded-t-lg p-8">
              <Heading className="text-white text-[28px] font-bold text-center m-0">{c.title}</Heading>
            </Section>

            <Section className="px-10 py-8">
              <Text className="text-[#333] text-[16px] leading-6.5 mb-4">
                {c.hello} <strong>{fullName}</strong>,
              </Text>

              <Text className="text-[#333] text-[16px] leading-6.5 mb-6">{c.intro}</Text>

              <Section className="text-center my-8">
                <Button
                  href={resetUrl}
                  className="bg-orange-600 text-white text-[16px] font-semibold no-underline text-center px-8 py-3 rounded-lg inline-block"
                >
                  {c.cta}
                </Button>
              </Section>

              <Section className="bg-[#f8f9fa] rounded-lg border border-solid border-[#e9ecef] p-4 my-6">
                <Text className="text-[#6c757d] text-[13px] m-0 mb-2">{c.fallbackLink}</Text>
                <Link href={resetUrl} className="text-[#007bff] text-[13px] break-all">
                  {resetUrl}
                </Link>
              </Section>

              <Section className="bg-[#fff3cd] border-l-4 border-solid border-[#ffc107] rounded p-4 my-6">
                <Text className="text-[#856404] text-[14px] leading-5.5 m-0">
                  <strong>{warning}</strong>
                </Text>
              </Section>

              <Text className="text-[#6c757d] text-[13px] leading-5 mb-2">{c.security}</Text>
              <Text className="text-[#6c757d] text-[13px] leading-5 m-0">{c.noreply}</Text>
            </Section>

            <Section className="bg-[#f8f9fa] rounded-b-lg px-10 py-6 text-center border-t border-solid border-[#e9ecef]">
              <Text className="text-[#6c757d] text-[12px] m-0">
                <strong>Vigitemp</strong> - {c.brand}
                <br />
                <Link href="https://www.mc2lab.fr" className="text-[#007bff] no-underline">
                  MC2 Lab
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PasswordResetEmail.PreviewProps = {
  resetUrl: 'http://192.168.63.144:3000/reset-password?token=abc123xyz789',
  firstName: 'Jean',
  lastName: 'Dupont',
  expiresIn: '1 heure',
  locale: 'fr',
} as PasswordResetEmailProps;

export default PasswordResetEmail;

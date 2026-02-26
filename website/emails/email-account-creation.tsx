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
  Tailwind,
  Text,
} from '@react-email/components';

type Locale = 'fr' | 'en';

interface AccountCreationEmailProps {
  username: string;
  temporaryPassword: string;
  loginUrl: string;
  firstName?: string;
  lastName?: string;
  locale?: Locale;
}

const COPY: Record<Locale, Record<string, string>> = {
  fr: {
    preview: 'Votre compte Vigitemp a ete cree',
    title: 'Bienvenue sur Vigitemp',
    hello: 'Bonjour',
    intro:
      'Votre compte Vigitemp a ete cree avec succes. Vous pouvez maintenant vous connecter avec les identifiants suivants :',
    login: 'Login',
    password: 'Mot de passe (temporaire)',
    warning:
      'Important : Ce mot de passe est temporaire. Pour des raisons de securite, vous devrez le changer lors de votre premiere connexion.',
    cta: 'Se connecter maintenant',
    contact: 'Si vous n\'avez pas demande la creation de ce compte, contactez votre administrateur systeme.',
    noreply: 'Cet email a ete envoye automatiquement, merci de ne pas y repondre.',
    brand: 'Systeme de surveillance environnementale',
  },
  en: {
    preview: 'Your Vigitemp account has been created',
    title: 'Welcome to Vigitemp',
    hello: 'Hello',
    intro:
      'Your Vigitemp account has been created successfully. You can now sign in using the credentials below:',
    login: 'Username',
    password: 'Password (temporary)',
    warning:
      'Important: This password is temporary. For security reasons, you must change it at first login.',
    cta: 'Sign in now',
    contact: 'If you did not request this account creation, please contact your system administrator.',
    noreply: 'This email was sent automatically, please do not reply.',
    brand: 'Environmental monitoring system',
  },
};

export const AccountCreationEmail = ({
  username,
  temporaryPassword,
  loginUrl,
  firstName,
  lastName,
  locale = 'fr',
}: AccountCreationEmailProps) => {
  const lang: Locale = locale === 'en' ? 'en' : 'fr';
  const c = COPY[lang];
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : username;

  return (
    <Html>
      <Preview>{c.preview}</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto my-16 p-0 max-w-150 rounded-lg shadow-lg">
            <Section className="bg-linear-to-r from-blue-600 to-blue-700 rounded-t-lg p-8">
              <Heading className="text-white text-[28px] font-bold text-center m-0">{c.title}</Heading>
            </Section>

            <Section className="px-10 py-8">
              <Text className="text-[#333] text-[16px] leading-6.5 mb-4">
                {c.hello} <strong>{fullName}</strong>,
              </Text>

              <Text className="text-[#333] text-[16px] leading-6.5 mb-6">{c.intro}</Text>

              <Section className="bg-[#f8f9fa] rounded-lg border border-solid border-[#e9ecef] p-6 my-6">
                <Text className="text-[#6c757d] text-[13px] font-semibold uppercase tracking-wide m-0 mb-2">
                  {c.login}
                </Text>
                <code className="block bg-white text-[#495057] text-[16px] font-mono font-bold p-3 rounded border border-solid border-[#dee2e6] mb-4">
                  {username}
                </code>

                <Text className="text-[#6c757d] text-[13px] font-semibold uppercase tracking-wide m-0 mb-2">
                  {c.password}
                </Text>
                <code className="block bg-white text-[#495057] text-[16px] font-mono font-bold p-3 rounded border border-solid border-[#dee2e6]">
                  {temporaryPassword}
                </code>
              </Section>

              <Section className="bg-[#fff3cd] border-l-4 border-solid border-[#ffc107] rounded p-4 my-6">
                <Text className="text-[#856404] text-[14px] leading-5.5 m-0">
                  <strong>{c.warning}</strong>
                </Text>
              </Section>

              <Section className="text-center my-8">
                <Button
                  href={loginUrl}
                  className="bg-blue-600 text-white text-[16px] font-semibold no-underline text-center px-8 py-3 rounded-lg inline-block"
                >
                  {c.cta}
                </Button>
              </Section>

              <Hr className="border-[#e9ecef] my-6" />

              <Text className="text-[#6c757d] text-[13px] leading-5 mb-2">{c.contact}</Text>
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

AccountCreationEmail.PreviewProps = {
  username: 'jdupont',
  temporaryPassword: 'TempPass123!',
  loginUrl: 'http://192.168.63.144:3000/login',
  firstName: 'Jean',
  lastName: 'Dupont',
  locale: 'fr',
} as AccountCreationEmailProps;

export default AccountCreationEmail;

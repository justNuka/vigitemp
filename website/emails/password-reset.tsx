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
  Img,
} from '@react-email/components';

interface PasswordResetEmailProps {
  resetUrl: string;
  firstName?: string;
  lastName?: string;
  expiresIn: string;
}

export const PasswordResetEmail = ({
  resetUrl,
  firstName,
  lastName,
  expiresIn = "1 heure",
}: PasswordResetEmailProps) => {
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : "utilisateur";
  
  return (
    <Html>
      <Preview>Réinitialisation de votre mot de passe Vigitemp</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto my-16 p-0 max-w-150 rounded-lg shadow-lg">
            {/* Logos Section */}
            <Section className="bg-white px-10 py-8 text-center border-b border-solid border-[#e9ecef]">
              {/* Vigitemp Logo - Large */}
              <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                width="280"
                height="80"
                viewBox="0 0 1024 292"
                style={{ marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
              >
                <g fill="#1E196A">
                  <path d="M293.2 72c-22 5.8-40.4 23.6-48.5 46.8-2.6 7.5-3.1 10.6-3.5 21.7-.5 15.5 1.4 24.9 7.7 38 9.8 20.5 27.1 34.6 47.6 39 22.6 4.8 48-3.8 65.6-22.2 10.6-11 9.9-8.9 9.9-31.4V144h-50v17h31v15.8l-7 6.6c-10.6 10-21.4 14.6-34.1 14.6-21.2 0-38.5-14.3-45.5-37.6-2.5-8.1-2.5-24.7 0-32.8 5.7-17.9 20.2-29.4 38.5-29.4 12 0 20.6 3.4 28 11.2l8.3-7.9C347.1 89.2 334 72 308 72c-12.7 0-25.3 3.1-36.8 9z" />
                  <path d="M582 148.5V159h101.1l-.3-10.3-.3-10.2-50.2-.3-50.3-.2zm1.8 49c-.5.5-.8 5.3-.8 10.7v9.8h101v-20h-40.2c-22.2 0-44.6-.3-49.8-.6-5.2-.4-9.8-.3-10.2.1" />
                </g>
              </svg>

              {/* MC2 Logo - Below Vigitemp */}
              <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="30"
                viewBox="0 0 200 60"
              >
                <text
                  x="100"
                  y="38"
                  fontSize="42"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#3B82F6"
                  fontFamily="Arial, sans-serif"
                >
                  MC2
                </text>
                <text
                  x="100"
                  y="55"
                  fontSize="10"
                  textAnchor="middle"
                  fill="#6C7280"
                  fontFamily="Arial, sans-serif"
                >
                  Technologies
                </text>
              </svg>
            </Section>

            {/* Header */}
            <Section className="bg-linear-to-r from-orange-600 to-orange-700 rounded-t-lg p-8">
              <Heading className="text-white text-[28px] font-bold text-center m-0">
                Réinitialisation de mot de passe
              </Heading>
            </Section>

            {/* Content */}
            <Section className="px-10 py-8">
              <Text className="text-[#333] text-[16px] leading-6.5 mb-4">
                Bonjour <strong>{fullName}</strong>,
              </Text>
              
              <Text className="text-[#333] text-[16px] leading-6.5 mb-6">
                Vous avez demandé la réinitialisation de votre mot de passe Vigitemp. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
              </Text>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={resetUrl}
                  className="bg-orange-600 text-white text-[16px] font-semibold no-underline text-center px-8 py-3 rounded-lg inline-block hover:bg-orange-700"
                >
                  Réinitialiser mon mot de passe
                </Button>
              </Section>

              {/* Link alternative */}
              <Section className="bg-[#f8f9fa] rounded-lg border border-solid border-[#e9ecef] p-4 my-6">
                <Text className="text-[#6c757d] text-[13px] m-0 mb-2">
                  Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                </Text>
                <Link href={resetUrl} className="text-[#007bff] text-[13px] break-all">
                  {resetUrl}
                </Link>
              </Section>

              {/* Warning Box */}
              <Section className="bg-[#fff3cd] border-l-4 border-solid border-[#ffc107] rounded p-4 my-6">
                <Text className="text-[#856404] text-[14px] leading-5.5 m-0">
                  <strong>⚠️ Important :</strong> Ce lien est valide pendant {expiresIn}. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email - votre mot de passe reste inchangé.
                </Text>
              </Section>

              {/* Security notice */}
              <Text className="text-[#6c757d] text-[13px] leading-5 mb-2">
                Pour votre sécurité, ne partagez jamais ce lien avec quiconque.
              </Text>
              
              <Text className="text-[#6c757d] text-[13px] leading-5 m-0">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-[#f8f9fa] rounded-b-lg px-10 py-6 text-center border-t border-solid border-[#e9ecef]">
              <Text className="text-[#6c757d] text-[12px] m-0">
                <strong>Vigitemp</strong> - Système de surveillance environnementale
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
  resetUrl: "http://192.168.63.144:3000/reset-password?token=abc123xyz789",
  firstName: "Jean",
  lastName: "Dupont",
  expiresIn: "1 heure",
} as PasswordResetEmailProps;

export default PasswordResetEmail;

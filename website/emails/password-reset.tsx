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
          <Container className="bg-white mx-auto my-16 p-0 max-w-[600px] rounded-lg shadow-lg">
            {/* Header */}
            <Section className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-t-lg p-8">
              <Heading className="text-white text-[28px] font-bold text-center m-0">
                Réinitialisation de mot de passe
              </Heading>
            </Section>

            {/* Content */}
            <Section className="px-10 py-8">
              <Text className="text-[#333] text-[16px] leading-[26px] mb-4">
                Bonjour <strong>{fullName}</strong>,
              </Text>
              
              <Text className="text-[#333] text-[16px] leading-[26px] mb-6">
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
                <Text className="text-[#856404] text-[14px] leading-[22px] m-0">
                  <strong>⚠️ Important :</strong> Ce lien est valide pendant {expiresIn}. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email - votre mot de passe reste inchangé.
                </Text>
              </Section>

              {/* Security notice */}
              <Text className="text-[#6c757d] text-[13px] leading-[20px] mb-2">
                Pour votre sécurité, ne partagez jamais ce lien avec quiconque.
              </Text>
              
              <Text className="text-[#6c757d] text-[13px] leading-[20px] m-0">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-[#f8f9fa] rounded-b-lg px-10 py-6 text-center border-t border-solid border-[#e9ecef]">
              <Text className="text-[#6c757d] text-[12px] m-0">
                <strong>Vigitemp</strong> - Système de surveillance environnementale
                <br />
                <Link href="https://www.mc2.fr" className="text-[#007bff] no-underline">
                  MC2 Technologies
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
  resetUrl: "https://vigitemp.example.com/reset-password?token=abc123xyz789",
  firstName: "Jean",
  lastName: "Dupont",
  expiresIn: "1 heure",
} as PasswordResetEmailProps;

export default PasswordResetEmail;

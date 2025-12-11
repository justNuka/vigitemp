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

interface AccountCreationEmailProps {
  username: string;
  temporaryPassword: string;
  loginUrl: string;
  firstName?: string;
  lastName?: string;
}

export const AccountCreationEmail = ({
  username,
  temporaryPassword,
  loginUrl,
  firstName,
  lastName,
}: AccountCreationEmailProps) => {
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : username;
  
  return (
    <Html>
      <Preview>Votre compte Vigitemp a été créé</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto my-16 p-0 max-w-[600px] rounded-lg shadow-lg">
            {/* Header with gradient */}
            <Section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg p-8">
              <Heading className="text-black text-[28px] font-bold text-center m-0">
                Bienvenue sur Vigitemp
              </Heading>
            </Section>

            {/* Content */}
            <Section className="px-10 py-8">
              <Text className="text-[#333] text-[16px] leading-[26px] mb-4">
                Bonjour <strong>{fullName}</strong>,
              </Text>
              
              <Text className="text-[#333] text-[16px] leading-[26px] mb-6">
                Votre compte Vigitemp a été créé avec succès. Vous pouvez maintenant vous connecter à l'application de surveillance environnementale avec les identifiants suivants :
              </Text>

              {/* Credentials Box */}
              <Section className="bg-[#f8f9fa] rounded-lg border border-solid border-[#e9ecef] p-6 my-6">
                <Text className="text-[#6c757d] text-[13px] font-semibold uppercase tracking-wide m-0 mb-2">
                  Login
                </Text>
                <code className="block bg-white text-[#495057] text-[16px] font-mono font-bold p-3 rounded border border-solid border-[#dee2e6] mb-4">
                  {username}
                </code>
                
                <Text className="text-[#6c757d] text-[13px] font-semibold uppercase tracking-wide m-0 mb-2">
                  Mot de passe (temporaire)
                </Text>
                <code className="block bg-white text-[#495057] text-[16px] font-mono font-bold p-3 rounded border border-solid border-[#dee2e6]">
                  {temporaryPassword}
                </code>
              </Section>

              {/* Warning Box */}
              <Section className="bg-[#fff3cd] border-l-4 border-solid border-[#ffc107] rounded p-4 my-6">
                <Text className="text-[#856404] text-[14px] leading-[22px] m-0">
                  <strong>⚠️ Important :</strong> Ce mot de passe est temporaire. Pour des raisons de sécurité, vous devrez le changer lors de votre première connexion.
                </Text>
              </Section>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={loginUrl}
                  className="bg-blue-600 text-white text-[16px] font-semibold no-underline text-center px-8 py-3 rounded-lg inline-block hover:bg-blue-700"
                >
                  Se connecter maintenant
                </Button>
              </Section>

              <Hr className="border-[#e9ecef] my-6" />

              {/* Footer */}
              <Text className="text-[#6c757d] text-[13px] leading-[20px] mb-2">
                Si vous n'avez pas demandé la création de ce compte, veuillez contacter votre administrateur système.
              </Text>
              
              <Text className="text-[#6c757d] text-[13px] leading-[20px] m-0">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </Text>
            </Section>

            {/* Footer branding */}
            <Section className="bg-[#f8f9fa] rounded-b-lg px-10 py-6 text-center border-t border-solid border-[#e9ecef]">
              <Text className="text-[#6c757d] text-[12px] m-0">
                <strong>Vigitemp</strong> - Système de surveillance environnementale
                <br />
                <Link href="https://www.mc2lab.fr" className="text-[#007bff] no-underline">
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

AccountCreationEmail.PreviewProps = {
  username: "jdupont",
  temporaryPassword: "TempPass123!",
  loginUrl: "https://vigitemp.example.com/login",
  firstName: "Jean",
  lastName: "Dupont",
} as AccountCreationEmailProps;

export default AccountCreationEmail;

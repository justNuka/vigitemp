import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const poppins = localFont({
  src: [
    {
      path: '../../../public/fonts/Poppins-Regular.ttf',
      weight: '400'
    },
    {
      path: '../../../public/fonts/Poppins-Medium.ttf',
      weight: '500'
    },
    {
      path: '../../../public/fonts/Poppins-SemiBold.ttf',
      weight: '600'
    },
    {
      path: '../../../public/fonts/Poppins-Bold.ttf',
      weight: '700'
    }
  ],
  variable: '--font-poppins'
})

const kodemono = localFont({
  src: [
    {
      path: '../../../public/fonts/KodeMono-Regular.ttf',
      weight: '400'
    },
    {
      path: '../../../public/fonts/KodeMono-Medium.ttf',
      weight: '500'
    },
    {
      path: '../../../public/fonts/KodeMono-SemiBold.ttf',
      weight: '600'
    },
    {
      path: '../../../public/fonts/KodeMono-Bold.ttf',
      weight: '700'
    }
  ],
  variable: '--font-kodemono'
})


export const metadata: Metadata = {
  title: "Vigitemp - Surveillance temps réel",
  description: "Système de surveillance et gestion des alarmes",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>;

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return notFound();
  }
  
  // Enable static rendering - CRITICAL!
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Toaster position="bottom-right" richColors closeButton />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

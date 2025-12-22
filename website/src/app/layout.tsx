import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

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
      path: '../../public/fonts/Poppins-Regular.ttf',
      weight: '400'
    },
    {
      path: '../../public/fonts/Poppins-Medium.ttf',
      weight: '500'
    },
    {
      path: '../../public/fonts/Poppins-SemiBold.ttf',
      weight: '600'
    },
    {
      path: '../../public/fonts/Poppins-Bold.ttf',
      weight: '700'
    }
  ],
  variable: '--font-poppins'
})

const kodemono = localFont({
  src: [
    {
      path: '../../public/fonts/KodeMono-Regular.ttf',
      weight: '400'
    },
    {
      path: '../../public/fonts/KodeMono-Medium.ttf',
      weight: '500'
    },
    {
      path: '../../public/fonts/KodeMono-SemiBold.ttf',
      weight: '600'
    },
    {
      path: '../../public/fonts/KodeMono-Bold.ttf',
      weight: '700'
    }
  ],
  variable: '--font-kodemono'
})


export const metadata: Metadata = {
  title: "Vigitemp - Surveillance temps réel",
  description: "Système de surveillance et gestion des alarmes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <Toaster position="bottom-right" richColors closeButton />
          {children}
        </Providers>
      </body>
    </html>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

export type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const messages: Record<Language, any> = {
  fr: fr,
  en: en,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");
  const [isHydrated, setIsHydrated] = useState(false);

  // Charger la langue depuis localStorage au mount (côté client uniquement)
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage && (savedLanguage === "fr" || savedLanguage === "en")) {
      setLanguage(savedLanguage);
    }
    setIsHydrated(true);
  }, []);

  // Avant l'hydratation, utiliser la langue par défaut
  if (!isHydrated) {
    return (
      <LanguageContext.Provider value={{ language: "fr", setLanguage }}>
        <NextIntlClientProvider
          locale="fr"
          messages={messages["fr"]}
          timeZone="Europe/Paris"
        >
          {children}
        </NextIntlClientProvider>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <NextIntlClientProvider
        locale={language}
        messages={messages[language]}
        timeZone="Europe/Paris"
      >
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

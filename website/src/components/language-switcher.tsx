"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, type Language } from "@/providers/language-provider";

const languageFlags: Record<Language, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
};

const languageNames: Record<Language, string> = {
  fr: "Français",
  en: "English",
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={`Langue actuelle: ${languageNames[language]}`}
          className="h-9 w-9 text-lg"
        >
          {languageFlags[language]}
          <span className="sr-only">Sélectionner la langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("fr")}
          className="gap-2 cursor-pointer"
        >
          <span className="text-lg">{languageFlags.fr}</span>
          <span>{languageNames.fr}</span>
          {language === "fr" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className="gap-2 cursor-pointer"
        >
          <span className="text-lg">{languageFlags.en}</span>
          <span>{languageNames.en}</span>
          {language === "en" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

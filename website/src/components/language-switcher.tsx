"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";

type Language = "fr" | "en";

const languageFlagSrc: Record<Language, string> = {
  fr: "/flags/fr.svg",
  en: "/flags/gb.svg",
};

const languageNames: Record<Language, string> = {
  fr: "Fran\u00e7ais",
  en: "English",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const language = (locale === "en" ? "en" : "fr") as Language;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLanguage: Language) => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const href = `${pathname || "/"}${search}`;
    router.push(href, { locale: newLanguage });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={`Langue actuelle: ${languageNames[language]}`}
          className="h-9 w-9"
        >
          <Image
            src={languageFlagSrc[language]}
            alt=""
            className="h-6 w-6 rounded-full"
          />
          <span className="sr-only">S\u00e9lectionner la langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("fr")}
          className="gap-2 cursor-pointer"
        >
          <Image
            src={languageFlagSrc.fr}
            alt=""
            className="h-5 w-5 rounded-full"
          />
          <span className="flex-1 text-sm ml-2">{languageNames.fr}</span>
          {language === "fr" && (
            <span className="ml-auto" aria-hidden="true">
              {"\u2713"}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className="gap-2 cursor-pointer"
        >
          <Image
            src={languageFlagSrc.en}
            alt=""
            className="h-5 w-5 rounded-full"
          />
          <span className="flex-1 text-sm ml-2">{languageNames.en}</span>
          {language === "en" && (
            <span className="ml-auto" aria-hidden="true">
              {"\u2713"}
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { stripLocalePrefix } from "@/i18n/pathnames";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

type Language = "fr" | "en";

const languageFlagSrc: Record<Language, string> = {
  fr: "/flags/fr.svg",
  en: "/flags/gb.svg",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const tSelect = useTranslations("dateRangePicker");
  const language = (locale === "en" ? "en" : "fr") as Language;
  const router = useRouter();
  const pathname = usePathname();
  const displayNames = new Intl.DisplayNames([locale], { type: "language" });
  const languageNames: Record<Language, string> = {
    fr: displayNames.of("fr") ?? "fr",
    en: displayNames.of("en") ?? "en",
  };

  const handleLanguageChange = (newLanguage: Language) => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const href = `${stripLocalePrefix(pathname || "/")}${search}`;
    router.push(href, { locale: newLanguage });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={languageNames[language]}
          aria-label={tSelect("select")}
          className="h-9 w-9"
        >
          <Image
            src={languageFlagSrc[language]}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
          <span className="sr-only">{tSelect("select")}</span>
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
            width={20}
            height={20}
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
            width={20}
            height={20}
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

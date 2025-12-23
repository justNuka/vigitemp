"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { PageHeaderBase, AlarmBanner, type PageHeaderProps } from "@/components/page-header-base";
import { useMemo } from "react";

interface TranslatedPageHeaderProps extends Omit<PageHeaderProps, 'title'> {
  titleKey?: string; // Clé de traduction (ex: "pageHeader.title")
  title?: string; // Titre direct si pas de clé de traduction
  descriptionKey?: string; // Clé pour description
}

export function PageHeader({
  titleKey,
  title,
  descriptionKey,
  description,
  ...props
}: TranslatedPageHeaderProps) {
  // Si un titre direct est fourni et pas de clés de traduction, éviter useTranslations
  if (title && !titleKey && !descriptionKey && !description) {
    return (
      <PageHeaderBase 
        title={title}
        {...props}
      />
    );
  }

  // Sinon, utiliser les traductions
  return <PageHeaderWithTranslations titleKey={titleKey} title={title} descriptionKey={descriptionKey} description={description} {...props} />;
}

function PageHeaderWithTranslations({
  titleKey,
  title,
  descriptionKey,
  description,
  ...props
}: TranslatedPageHeaderProps) {
  const t = useTranslations();

  const displayTitle = useMemo(() => {
    if (title) return title;
    if (titleKey) return t(titleKey);
    return t("pageHeader.title");
  }, [title, titleKey, t]);

  const displayDescription = useMemo(() => {
    if (description) return description;
    if (descriptionKey) return t(descriptionKey);
    return undefined;
  }, [description, descriptionKey, t]);

  return (
    <PageHeaderBase 
      title={displayTitle}
      description={displayDescription}
      {...props}
    />
  );
}

export { AlarmBanner };
export type { PageHeaderProps };

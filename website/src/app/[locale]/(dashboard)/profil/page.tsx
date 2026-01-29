"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { PageHeader } from "@/components/page-header";
import { Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';

import { AccountInfoCard } from "./_components/account-info-card";
import { SecurityCard } from "./_components/security-card";

export default function ProfilePage() {
  const t = useTranslations('profilePage');
  const { data: userInfo, isLoading: isLoadingUser } = useCurrentUser();
  const { data: rules, isLoading: rulesLoading } = usePasswordRules();

  if (isLoadingUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t('title')}
        description={t('description')}
        activeAlarms={0}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
        <AccountInfoCard userInfo={userInfo} />
        {userInfo && (
          <SecurityCard userInfo={userInfo} rules={rules} rulesLoading={rulesLoading} />
        )}
      </main>
    </div>
  );
}

"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { PageHeader } from "@/components/page-header";
import { Loader2 } from "lucide-react";

import { AccountInfoCard } from "./_components/account-info-card";
import { SecurityCard } from "./_components/security-card";

export default function ProfilePage() {
  const { data: userInfo, isLoading: isLoadingUser } = useCurrentUser();
  const { data: rules, isLoading: rulesLoading } = usePasswordRules();

  if (rulesLoading || isLoadingUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles et vos paramètres de sécurité"
        activeAlarms={0}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
        <AccountInfoCard userInfo={userInfo} />
        {userInfo && <SecurityCard userInfo={userInfo} rules={rules} />}
      </main>
    </div>
  );
}

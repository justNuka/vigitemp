"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslations } from 'next-intl';

import { AccountInfoCard } from "./_components/account-info-card";
import { SecurityCard } from "./_components/security-card";

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  const t = useTranslations('profilePage');
  const { data: userInfo, isLoading: isLoadingUser } = useCurrentUser();
  const { data: rules, isLoading: rulesLoading } = usePasswordRules();

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t('title')}
        description={t('description')}
        activeAlarms={0}
      />

      <main className="flex-1 p-4 md:p-6 animate-fade-in">
        {isLoadingUser ? (
          <ProfileSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <AccountInfoCard userInfo={userInfo} />
            {userInfo && (
              <SecurityCard userInfo={userInfo} rules={rules} rulesLoading={rulesLoading} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

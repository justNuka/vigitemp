import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FirstLoginSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Skeleton className="w-96 h-96" />
    </div>
  );
}

export default function FirstLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<FirstLoginSkeleton />}>
      {children}
    </Suspense>
  );
}

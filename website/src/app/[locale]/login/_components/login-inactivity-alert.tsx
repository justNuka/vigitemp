"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginInactivityAlert({ message }: { message: string }) {
  return (
    <Alert variant="default" className="mb-4 border-yellow-500/50 bg-yellow-500/10">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-600">{message}</AlertDescription>
    </Alert>
  );
}


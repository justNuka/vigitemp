"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginInactivityAlertProps = {
  message: string
  variant?: "warning" | "info"
}

export function LoginInactivityAlert({
  message,
  variant = "warning",
}: LoginInactivityAlertProps) {
  const toneClasses =
    variant === "info"
      ? {
          root: "border-sky-500/40 bg-sky-500/10",
          icon: "text-sky-600",
          text: "text-sky-700",
        }
      : {
          root: "border-yellow-500/50 bg-yellow-500/10",
          icon: "text-yellow-600",
          text: "text-yellow-600",
        }

  return (
    <Alert variant="default" className={`mb-4 ${toneClasses.root}`}>
      <AlertCircle className={`h-4 w-4 ${toneClasses.icon}`} />
      <AlertDescription className={toneClasses.text}>{message}</AlertDescription>
    </Alert>
  );
}


"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

type ResetFormValues = {
  email: string;
};

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  success,
  onSubmit,
  onClose,
  isSubmitting,
  translations,
  register,
  errors,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  success: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  translations: {
    title: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    successMessage: string;
    cancel: string;
    send: string;
    sending: string;
    close: string;
  };
  register: UseFormRegister<ResetFormValues>;
  errors: FieldErrors<ResetFormValues>;
}) {
  const emailError = errors.email?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{translations.title}</DialogTitle>
          <DialogDescription>{translations.description}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {translations.successMessage}
            </p>
            <Button onClick={onClose} className="w-full">
              {translations.close}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">{translations.emailLabel}</Label>
              <Input
                id="reset-email"
                type="email"
                {...register("email")}
                placeholder={translations.emailPlaceholder}
                autoFocus
                disabled={isSubmitting}
                autoComplete="email"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "reset-email-error" : undefined}
              />
              {emailError && (
                <p id="reset-email-error" className="text-sm text-destructive">
                  {String(emailError)}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                {translations.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? translations.sending : translations.send}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}


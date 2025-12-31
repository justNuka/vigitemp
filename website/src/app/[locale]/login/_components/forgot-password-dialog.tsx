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

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  success,
  email,
  onEmailChange,
  onSubmit,
  onClose,
  isSubmitting,
  translations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  success: boolean;
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
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
}) {
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
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder={translations.emailPlaceholder}
                required
                autoFocus
                disabled={isSubmitting}
                autoComplete="email"
              />
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


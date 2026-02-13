"use client";
import { showFormValidationToast } from "@/lib/form-toast"

import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { getJson, postJson, putJson } from "@/lib/http";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  sender: string;
}

interface SMTPConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SMTPConfigModal({ open, onOpenChange }: SMTPConfigModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("adminSettings.smtp_modal");

  const smtpSchema = useMemo(
    () =>
      z.object({
        host: z.string().min(1, t("validation.host_required")),
        port: z
          .number()
          .int()
          .min(1, t("validation.port_range"))
          .max(65535, t("validation.port_range")),
        user: z.string().min(1, t("validation.user_required")),
        password: z.string().min(1, t("validation.password_required")),
        sender: z
          .string()
          .min(1, t("validation.sender_required"))
          .email(t("validation.email_invalid")),
      }),
    [t]
  );

  const testSchema = useMemo(
    () =>
      z.object({
        testEmail: z
          .string()
          .min(1, t("validation.test_email_required"))
          .email(t("validation.email_invalid")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SMTPConfig>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: "",
      port: 587,
      user: "",
      password: "",
      sender: "noreply@vigitemp.fr",
    },
  });

  const {
    register: registerTest,
    handleSubmit: handleTestSubmit,
    setValue: setTestValue,
    formState: { errors: testErrors },
  } = useForm<{ testEmail: string }>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testEmail: "",
    },
  });

  // Charger la configuration a l'ouverture du modal
  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const payload = await getJson<SMTPConfig>("/api/admin/configuration-smtp");
      reset(payload);
      setTestValue("testEmail", payload.sender || payload.user || "");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(t("toasts.fetch_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (newConfig: SMTPConfig) => {
      return putJson<{ message: string }>("/api/admin/configuration-smtp", newConfig);
    },
    onSuccess: () => {
      toast.success(t("toasts.update_success"));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("toasts.update_error"));
    },
  });

  const testMutation = useMutation({
    mutationFn: async (toEmail: string) => {
      return postJson<{ message?: string }>("/api/email/test", { toEmail });
    },
    onSuccess: (data) => {
      toast.success(data?.message || t("toasts.test_success"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("toasts.test_error"));
    },
  });

  const onSubmit = (data: SMTPConfig) => {
    updateMutation.mutate(data);
  };

  const onTest = ({ testEmail }: { testEmail: string }) => {
    testMutation.mutate(testEmail.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white/50 dark:bg-card">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
          <div>
            <Label htmlFor="host">{t("fields.host.label")}</Label>
            <Input
              id="host"
              type="text"
              placeholder={t("fields.host.placeholder")}
              {...register("host")}
              disabled={isLoading || updateMutation.isPending || isSubmitting}
              aria-invalid={!!errors.host}
              aria-describedby={errors.host ? "smtp-host-error" : undefined}
            />
            {errors.host?.message && (
              <p id="smtp-host-error" className="text-sm text-destructive">
                {String(errors.host.message)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t("fields.host.helper")}
            </p>
          </div>

          <div>
            <Label htmlFor="port">{t("fields.port.label")}</Label>
            <Input
              id="port"
              type="number"
              placeholder={t("fields.port.placeholder")}
              {...register("port", { valueAsNumber: true })}
              disabled={isLoading || updateMutation.isPending || isSubmitting}
              min="1"
              max="65535"
              aria-invalid={!!errors.port}
              aria-describedby={errors.port ? "smtp-port-error" : undefined}
            />
            {errors.port?.message && (
              <p id="smtp-port-error" className="text-sm text-destructive">
                {String(errors.port.message)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t("fields.port.helper")}
            </p>
          </div>

          <div>
            <Label htmlFor="user">{t("fields.user.label")}</Label>
            <Input
              id="user"
              type="email"
              placeholder={t("fields.user.placeholder")}
              {...register("user")}
              disabled={isLoading || updateMutation.isPending || isSubmitting}
              aria-invalid={!!errors.user}
              aria-describedby={errors.user ? "smtp-user-error" : undefined}
            />
            {errors.user?.message && (
              <p id="smtp-user-error" className="text-sm text-destructive">
                {String(errors.user.message)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">{t("fields.password.label")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("fields.password.placeholder")}
              {...register("password")}
              disabled={isLoading || updateMutation.isPending || isSubmitting}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "smtp-password-error" : undefined}
            />
            {errors.password?.message && (
              <p id="smtp-password-error" className="text-sm text-destructive">
                {String(errors.password.message)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t("fields.password.helper")}
            </p>
          </div>

          <div>
            <Label htmlFor="sender">{t("fields.sender.label")}</Label>
            <Input
              id="sender"
              type="email"
              placeholder={t("fields.sender.placeholder")}
              {...register("sender")}
              disabled={isLoading || updateMutation.isPending || isSubmitting}
              aria-invalid={!!errors.sender}
              aria-describedby={errors.sender ? "smtp-sender-error" : undefined}
            />
            {errors.sender?.message && (
              <p id="smtp-sender-error" className="text-sm text-destructive">
                {String(errors.sender.message)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t("fields.sender.helper")}
            </p>
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              {t("test.title")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("test.description")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="test-email"
                type="email"
                placeholder={t("test.placeholder")}
                {...registerTest("testEmail")}
                disabled={isLoading || updateMutation.isPending || testMutation.isPending}
                aria-invalid={!!testErrors.testEmail}
                aria-describedby={testErrors.testEmail ? "smtp-test-email-error" : undefined}
              />
              {testErrors.testEmail?.message && (
                <p id="smtp-test-email-error" className="text-sm text-destructive">
                  {String(testErrors.testEmail.message)}
                </p>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestSubmit(onTest)}
                disabled={isLoading || updateMutation.isPending || testMutation.isPending}
              >
                {testMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("test.loading")}
                  </>
                ) : (
                  t("test.button")
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || updateMutation.isPending}
            >
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("buttons.saving")}
                </>
              ) : (
                t("buttons.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";
import { showFormValidationToast } from "@/lib/form-toast"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import { Logo } from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getAgentInfo, setAgentSecret, setAgentSession } from "@/lib/agent-session";
import { getJson, HttpError, postJson } from "@/lib/http";
import type { CurrentUser } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import { clearDisconnectReason, consumeDisconnectReason } from "@/lib/auth-disconnect-marker";
import { LoginCredentialsForm } from "./_components/login-credentials-form";
import { ForgotPasswordDialog } from "./_components/forgot-password-dialog";
import { LoginInactivityAlert } from "./_components/login-inactivity-alert";
import { useLicense } from "@/components/license/license-provider";
import { formatLicenseLabel } from "@/lib/license-label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type LoginResponse = {
  id: number;
  username: string;
  displayName: string;
  profile: string;
  authorizations: string[];
  token: string;
};

type AuthApiErrorPayload = {
  ok: false;
  error: string;
  message: string;
  requirePasswordChange?: boolean;
  userId?: number;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("login");
  const tCommon = useTranslations("common");
  const { license } = useLicense();
  const licenseLabel = formatLicenseLabel(license, tCommon);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const reason = searchParams.get("reason");
  const passwordChanged = searchParams.get("passwordChanged");
  const fromParam = searchParams.get("from");
  const [showInactivityMessage, setShowInactivityMessage] = useState(false);

  useEffect(() => {
    if (reason === "inactivity") {
      const canShow = consumeDisconnectReason("inactivity");
      setShowInactivityMessage(canShow);
    } else if (reason === "session-expired") {
      setShowInactivityMessage(true);
    } else {
      setShowInactivityMessage(false);
    }

    if (passwordChanged === "true") {
      toast.success(t("toasts.password_changed.title"), {
        description: t("toasts.password_changed.description"),
      });
    }
  }, [passwordChanged, reason, t]);

  useEffect(() => {
    if (!showInactivityMessage) return;
    toast.warning(t("toasts.session_expired.title"), {
      description: t("toasts.session_expired.description"),
    });
  }, [showInactivityMessage, t]);

  const loginSchema = z.object({
    username: z
      .string()
      .min(1, t("validation.username_required")),
    password: z
      .string()
      .min(1, t("validation.password_required")),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const resetSchema = z.object({
    email: z
      .string()
      .min(1, t("toasts.invalid_email"))
      .email(t("toasts.invalid_email")),
  });

  type ResetFormValues = z.infer<typeof resetSchema>;

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    reset: resetResetForm,
    formState: { errors: resetErrors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      try {
        const agentInfo = await getAgentInfo().catch(() => null);
        return await postJson<LoginResponse>("/api/auth/login", {
          username: values.username,
          password: values.password,
          machineName: agentInfo?.machineName,
        });
      } catch (err) {
        if (err instanceof HttpError) {
          const payload = err.payload as AuthApiErrorPayload | undefined;
          if (payload?.requirePasswordChange) {
            try {
              await postJson<{ success: true }>("/api/auth/temp-password-token", {
                username: values.username,
              });
              router.push("/force-password-change");
            } catch {
              toast.error(t("toasts.redirect_error"));
            }
            throw new Error("password_change_required");
          }
        }
        throw err;
      }
    },
    onSuccess: async (data: LoginResponse) => {
      clearDisconnectReason();
      toast.success(t("toasts.login_success"));

      try {
        await setAgentSession({
          userId: String(data.id),
          username: data.displayName || data.username,
        });

        const secretRes = await fetch("/api/agent/secret", { method: "GET" });
        if (secretRes.ok) {
          const payload = (await secretRes.json()) as { secret?: string };
          if (payload.secret) {
            await setAgentSecret(payload.secret);
          }
        }
      } catch {
        // Agent not installed/running: ignore
      }

      const getRedirectTarget = (userCanAccessDashboard: boolean) => {
        if (!userCanAccessDashboard) return "/surveillance";
        if (!fromParam) return "/";
        const trimmed = fromParam.trim();
        if (!trimmed.startsWith("/")) return "/";
        if (trimmed.startsWith("//")) return "/";
        return trimmed;
      };

      let canAccessDashboard = true;
      try {
        const me = await getJson<CurrentUser>("/api/me");
        canAccessDashboard = hasPermission(me, "DASHBOARD_USER_ACCESS");
      } catch {
        // fallback on default redirect
      }

      router.push(getRedirectTarget(canAccessDashboard));
    },
    onError: (error: Error) => {
      if (error.message !== "password_change_required") {
        toast.error(t("toasts.bad_credentials"));
      }
    },
  });

  const handleFormSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return postJson<{ message: string }>("/api/auth/request-password-reset", { email });
    },
    onSuccess: () => {
      setResetSuccess(true);
      toast.success(t("toasts.reset_email_sent.title"), {
        description: t("toasts.reset_email_sent.description"),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleResetPasswordSubmit = (values: ResetFormValues) => {
    resetPasswordMutation.mutate(values.email);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setResetSuccess(false);
    resetResetForm();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 bg-linear-to-br from-background via-background to-muted/20">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="lg" showText />
          <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {licenseLabel}
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("card.title")}</CardTitle>
            <CardDescription>
              {t("card.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <>
              {showInactivityMessage && (
                <LoginInactivityAlert message={t("inactivity_alert")} />
              )}

              <LoginCredentialsForm
                register={register}
                errors={errors}
                onSubmit={handleSubmit(handleFormSubmit, (errors) => showFormValidationToast(errors))}
                onForgotPassword={() => setShowForgotPassword(true)}
                isSubmitting={loginMutation.isPending}
                translations={{
                  usernameLabel: t("fields.username_label"),
                  usernamePlaceholder: t("fields.username_placeholder"),
                  passwordLabel: t("fields.password_label"),
                  passwordPlaceholder: t("fields.password_placeholder"),
                  signingIn: t("buttons.signing_in"),
                  signIn: t("buttons.sign_in"),
                  forgotPassword: t("buttons.forgot_password"),
                }}
              />
            </>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">{t("footer.tagline")}</p>
      </div>

      <p className="w-full text-center text-xs text-muted-foreground/70 pb-4">
        Vigi<span className="font-semibold">Sensys</span> - MC2 Lab
      </p>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={handleCloseForgotPassword}
        success={resetSuccess}
        register={registerReset}
        errors={resetErrors}
        onSubmit={handleResetSubmit(handleResetPasswordSubmit)}
        onClose={handleCloseForgotPassword}
        isSubmitting={resetPasswordMutation.isPending}
        translations={{
          title: t("reset_modal.title"),
          description: t("reset_modal.description"),
          emailLabel: t("fields.reset_email_label"),
          emailPlaceholder: t("fields.reset_email_placeholder"),
          successMessage: t("reset_modal.success_message"),
          cancel: tCommon("cancel"),
          send: t("buttons.send"),
          sending: t("buttons.sending"),
          close: tCommon("close"),
        }}
      />
    </div>
  );
}



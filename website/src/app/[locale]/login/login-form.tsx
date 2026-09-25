"use client";
import { showFormValidationToast } from "@/lib/form-toast"

import { useCallback, useEffect, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { FirstLoginWelcome } from "./_components/first-login-welcome";
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
  passwordExpiryWarningDays?: number | null;
  isFirstLogin: boolean;
  passwordExpiryEnabled: boolean;
  passwordValidityDays: number | null;
};

const FIRST_LOGIN_TRANSITION_MIN_MS = 1600;

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
  const [showPasswordExpiryWarning, setShowPasswordExpiryWarning] = useState(false);
  const [showFirstLoginWelcome, setShowFirstLoginWelcome] = useState(false);
  const [isCompletingFirstLogin, setIsCompletingFirstLogin] = useState(false);
  const [pendingLoginResponse, setPendingLoginResponse] = useState<LoginResponse | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;
  const dur = shouldReduceMotion ? 0 : 0.5;

  const reason = searchParams.get("reason");
  const passwordChanged = searchParams.get("passwordChanged");
  const fromParam = searchParams.get("from");
  const [loginAlertReason, setLoginAlertReason] = useState<"inactivity" | "session-expired" | null>(null);

  useEffect(() => {
    const nextLoginAlertReason =
      reason === "inactivity"
        ? (consumeDisconnectReason("inactivity") ? "inactivity" : null)
        : reason === "session-expired"
          ? "session-expired"
          : null;

    const syncTimer = window.setTimeout(() => {
      setLoginAlertReason(nextLoginAlertReason);
    }, 0);

    if (passwordChanged === "true") {
      toast.success(t("toasts.password_changed.title"), {
        description: t("toasts.password_changed.description"),
      });
    }

    return () => {
      window.clearTimeout(syncTimer);
    };
  }, [passwordChanged, reason, t]);

  useEffect(() => {
    if (!loginAlertReason) return;

    if (loginAlertReason === "session-expired") {
      toast.info(t("toasts.session_expired.title"), {
        description: t("toasts.session_expired.description"),
      });
      return;
    }

    toast.warning(t("toasts.session_expired.title"), {
      description: t("toasts.session_expired.description"),
    });
  }, [loginAlertReason, t]);

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
      if (data.isFirstLogin) {
        setPendingLoginResponse(data);
        setShowFirstLoginWelcome(true);
        return;
      }

      if (data.passwordExpiryWarningDays && data.passwordExpiryWarningDays > 0) {
        setPendingLoginResponse(data);
        setShowPasswordExpiryWarning(true);
        return;
      }

      await finalizeLogin(data);
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

  const finalizeLogin = useCallback(async (data: LoginResponse, minimumTransitionMs = 0) => {
    const transitionStartedAt = Date.now();
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
      if (fromParam) {
        const trimmed = fromParam.trim();
        if (!trimmed.startsWith("/")) return "/";
        if (trimmed.startsWith("//")) return "/";
        return trimmed;
      }
      if (!userCanAccessDashboard) return "/surveillance";
      return "/";
    };

    let canAccessDashboard = true;
    try {
      const me = await getJson<CurrentUser>("/api/me");
      canAccessDashboard = hasPermission(me, "DASHBOARD_USER_ACCESS");
    } catch {
      // fallback on default redirect
    }

    const remainingTransitionMs = minimumTransitionMs - (Date.now() - transitionStartedAt);
    if (remainingTransitionMs > 0) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, remainingTransitionMs));
    }

    router.push(getRedirectTarget(canAccessDashboard));
  }, [fromParam, router, t]);

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setResetSuccess(false);
    resetResetForm();
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="grid min-h-screen w-full bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
          <Logo size="md" showText />
          <LoginTrace reduced={Boolean(shouldReduceMotion)} />
          <div>
            <p className="text-lg font-semibold tracking-[-0.01em]">{t("subtitle")}</p>
            <p className="mt-1 text-[13px] text-sidebar-foreground/65">{t("footer.tagline")}</p>
          </div>
        </aside>

        <main className="relative flex items-center justify-center px-6 py-12">
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <m.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease }}
            className="w-full max-w-sm"
          >
            <div className="mb-8 text-foreground lg:hidden">
              <Logo size="md" showText />
            </div>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold tracking-[-0.01em] text-foreground">{t("title")}</h1>
                  <p className="mt-1 text-[13px] text-muted-foreground">{t("card.description")}</p>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-md border border-primary/20 bg-[hsl(var(--primary-soft))] px-2 py-1 text-[11px] font-medium text-[hsl(var(--primary-strong))]">
                  {licenseLabel}
                </span>
              </div>

              {loginAlertReason ? (
                <LoginInactivityAlert
                  message={
                    loginAlertReason === "session-expired"
                      ? t("session_expired_alert")
                      : t("inactivity_alert")
                  }
                  variant={loginAlertReason === "session-expired" ? "info" : "warning"}
                />
              ) : null}
            </div>

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
                showPassword: t("fields.show_password"),
                hidePassword: t("fields.hide_password"),
                capsLockWarning: t("fields.caps_lock_warning"),
              }}
            />
          </m.div>
        </main>

        <FirstLoginWelcome
          open={showFirstLoginWelcome}
          displayName={pendingLoginResponse?.displayName || pendingLoginResponse?.username || ""}
          passwordExpiryEnabled={pendingLoginResponse?.passwordExpiryEnabled ?? false}
          passwordValidityDays={pendingLoginResponse?.passwordValidityDays ?? null}
          isCompleting={isCompletingFirstLogin}
          onContinue={() => {
            const response = pendingLoginResponse;
            if (!response) {
              setShowFirstLoginWelcome(false);
              return;
            }

            if (response.passwordExpiryWarningDays && response.passwordExpiryWarningDays > 0) {
              setShowFirstLoginWelcome(false);
              setShowPasswordExpiryWarning(true);
              return;
            }

            setIsCompletingFirstLogin(true);
            setPendingLoginResponse(null);
            void finalizeLogin(response, FIRST_LOGIN_TRANSITION_MIN_MS);
          }}
        />

        <AlertDialog
          open={showPasswordExpiryWarning}
          onOpenChange={(open) => {
            if (!open) return;
            setShowPasswordExpiryWarning(open);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("expiry_warning_dialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("expiry_warning_dialog.description", {
                  count: pendingLoginResponse?.passwordExpiryWarningDays ?? 0,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  const response = pendingLoginResponse;
                  setShowPasswordExpiryWarning(false);
                  if (!response) {
                    setPendingLoginResponse(null);
                    return;
                  }

                  if (response.isFirstLogin) {
                    setShowFirstLoginWelcome(true);
                    setIsCompletingFirstLogin(true);
                    setPendingLoginResponse(null);
                    void finalizeLogin(response, FIRST_LOGIN_TRANSITION_MIN_MS);
                    return;
                  }

                  setPendingLoginResponse(null);
                  void finalizeLogin(response);
                }}
              >
                {t("expiry_warning_dialog.continue")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
    </LazyMotion>
  );
}

function LoginTrace({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 400 180" aria-hidden className="w-full max-w-md opacity-90">
      <rect x={0} y={50} width={400} height={80} fill="hsl(var(--primary) / 0.07)" />
      <line x1={0} x2={400} y1={50} y2={50} stroke="hsl(var(--status-critical) / 0.5)" strokeDasharray="5 4" />
      <line x1={0} x2={400} y1={130} y2={130} stroke="hsl(var(--status-critical) / 0.5)" strokeDasharray="5 4" />
      <line x1={0} x2={400} y1={90} y2={90} stroke="hsl(var(--sidebar-foreground) / 0.25)" />
      <m.path
        d="M0 96 L40 90 L80 99 L120 84 L160 92 L200 80 L240 88 L280 76 L320 86 L360 82 L400 88"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.1, ease: [0.23, 1, 0.32, 1] }}
      />
      <circle cx={400} cy={88} r={3.5} fill="hsl(var(--primary))" />
    </svg>
  )
}

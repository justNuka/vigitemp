"use client";

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
import { getAgentInfo, setAgentSession } from "@/lib/agent-session";
import { HttpError, postJson } from "@/lib/http";
import { LoginCredentialsForm } from "./_components/login-credentials-form";
import { ForgotPasswordDialog } from "./_components/forgot-password-dialog";
import { LoginInactivityAlert } from "./_components/login-inactivity-alert";

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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const reason = searchParams.get("reason");
  const passwordChanged = searchParams.get("passwordChanged");
  const showInactivityMessage = reason === "inactivity";

  useEffect(() => {
    if (showInactivityMessage) {
      toast.warning(t("toasts.session_expired.title"), {
        description: t("toasts.session_expired.description"),
      });
    }

    if (passwordChanged === "true") {
      toast.success(t("toasts.password_changed.title"), {
        description: t("toasts.password_changed.description"),
      });
    }
  }, [passwordChanged, showInactivityMessage, t]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        const agentInfo = await getAgentInfo().catch(() => null);
        return await postJson<LoginResponse>("/api/auth/login", {
          username,
          password,
          machineName: agentInfo?.machineName,
        });
      } catch (err) {
        if (err instanceof HttpError) {
          const payload = err.payload as AuthApiErrorPayload | undefined;
          if (payload?.requirePasswordChange) {
            try {
              await postJson<{ success: true }>("/api/auth/temp-password-token", { username });
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
      toast.success(t("toasts.login_success"));

      try {
        await setAgentSession({
          userId: String(data.id),
          username: data.displayName || data.username,
        });
      } catch {
        // Agent not installed/running: ignore
      }

      router.push("/");
    },
    onError: (error: Error) => {
      if (error.message !== "password_change_required") {
        toast.error(t("toasts.bad_credentials"));
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error(t("toasts.fill_all_fields"));
      return;
    }
    loginMutation.mutate();
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      return postJson<{ message: string }>("/api/auth/request-password-reset", { email: resetEmail });
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

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      toast.error(t("toasts.invalid_email"));
      return;
    }
    resetPasswordMutation.mutate();
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetSuccess(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="lg" showText />
          <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {tCommon("license_light")}
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
                username={username}
                password={password}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onSubmit={handleSubmit}
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
        Vigitemp - MC2 Lab
      </p>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={handleCloseForgotPassword}
        success={resetSuccess}
        email={resetEmail}
        onEmailChange={setResetEmail}
        onSubmit={handleResetPasswordSubmit}
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

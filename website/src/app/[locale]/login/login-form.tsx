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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FirstLoginForm } from "@/components/auth/first-login-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { setAgentSession } from "@/lib/agent-session";

type LoginResponse = {
  id: number;
  username: string;
  displayName: string;
  profile: string;
  authorizations: string[];
  token: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("login");
  const tCommon = useTranslations("common");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showInactivityMessage, setShowInactivityMessage] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [firstLoginUserId, setFirstLoginUserId] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const reason = searchParams.get("reason");
    const passwordChanged = searchParams.get("passwordChanged");

    if (reason === "inactivity") {
      setShowInactivityMessage(true);
      toast.warning(t("toasts.session_expired.title"), {
        description: t("toasts.session_expired.description"),
      });
    }

    if (passwordChanged === "true") {
      toast.success(t("toasts.password_changed.title"), {
        description: t("toasts.password_changed.description"),
      });
    }
  }, [searchParams, t]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.requirePasswordChange) {
          if (error.error === "temporary_password") {
            setFirstLoginUserId(error.userId);
            setShowFirstLogin(true);
            throw new Error("temporary_password");
          }

          try {
            const tokenRes = await fetch("/api/auth/temp-password-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username }),
            });
            if (tokenRes.ok) {
              router.push("/force-password-change");
            } else {
              toast.error(t("toasts.redirect_error"));
            }
          } catch {
            toast.error(t("toasts.security_error"));
          }
          throw new Error("password_change_required");
        }
        throw new Error("Login failed");
      }

      return res.json();
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
      if (error.message === "temporary_password") {
        toast.info(t("toasts.first_login.title"), {
          description: t("toasts.first_login.description"),
        });
      } else if (error.message !== "password_change_required") {
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
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t("toasts.reset_request_error"));
      }

      return res.json();
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
              {showFirstLogin ? t("card.first_login") : t("card.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showFirstLogin && firstLoginUserId ? (
              <FirstLoginForm
                userId={firstLoginUserId}
                onSuccess={() => {
                  toast.success(t("toasts.password_changed_after_first_login.title"), {
                    description: t("toasts.password_changed_after_first_login.description"),
                  });
                  setShowFirstLogin(false);
                  setFirstLoginUserId(null);
                  setUsername("");
                  setPassword("");
                }}
              />
            ) : (
              <>
                {showInactivityMessage && (
                  <Alert
                    variant="default"
                    className="mb-4 border-yellow-500/50 bg-yellow-500/10"
                  >
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-600">
                      {t("inactivity_alert")}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t("fields.username_label")}</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t("fields.username_placeholder")}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t("fields.password_label")}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("fields.password_placeholder")}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? t("buttons.signing_in") : t("buttons.sign_in")}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:underline"
                      disabled={loginMutation.isPending}
                    >
                      {t("buttons.forgot_password")}
                    </button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">{t("footer.tagline")}</p>
      </div>

      <p className="w-full text-center text-xs text-muted-foreground/70 pb-4">
        Vigitemp - MC2 Technologies
      </p>

      <Dialog open={showForgotPassword} onOpenChange={handleCloseForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("reset_modal.title")}</DialogTitle>
            <DialogDescription>{t("reset_modal.description")}</DialogDescription>
          </DialogHeader>

          {resetSuccess ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {t("reset_modal.success_message")}
              </p>
              <Button onClick={handleCloseForgotPassword} className="w-full">
                {tCommon("close")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t("fields.reset_email_label")}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder={t("fields.reset_email_placeholder")}
                  required
                  autoFocus
                  disabled={resetPasswordMutation.isPending}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForgotPassword}
                  disabled={resetPasswordMutation.isPending}
                  className="flex-1"
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={resetPasswordMutation.isPending} className="flex-1">
                  {resetPasswordMutation.isPending ? t("buttons.sending") : t("buttons.send")}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


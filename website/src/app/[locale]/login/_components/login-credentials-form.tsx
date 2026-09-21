"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Keyboard } from "lucide-react";
import { useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

type LoginFormValues = {
  username: string;
  password: string;
};

export function LoginCredentialsForm({
  onSubmit,
  onForgotPassword,
  isSubmitting,
  translations,
  register,
  errors,
}: {
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  onForgotPassword: () => void;
  isSubmitting: boolean;
  translations: {
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    signingIn: string;
    signIn: string;
    forgotPassword: string;
    showPassword: string;
    hidePassword: string;
    capsLockWarning: string;
  };
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
}) {
  const usernameError = errors.username?.message;
  const passwordError = errors.password?.message;
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const passwordRegistration = register("password");

  const syncCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockActive(event.getModifierState("CapsLock"));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">{translations.usernameLabel}</Label>
        <Input
          id="username"
          type="text"
          {...register("username")}
          placeholder={translations.usernamePlaceholder}
          className="bg-background text-foreground placeholder:text-muted-foreground"
          autoFocus
          autoComplete="username"
          aria-invalid={!!usernameError}
          aria-describedby={usernameError ? "username-error" : undefined}
        />
        {usernameError && (
          <p id="username-error" className="text-sm text-destructive">
            {String(usernameError)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{translations.passwordLabel}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...passwordRegistration}
            placeholder={translations.passwordPlaceholder}
            className="bg-background pr-11 text-foreground placeholder:text-muted-foreground"
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            aria-describedby={[
              passwordError ? "password-error" : null,
              capsLockActive ? "password-caps-lock" : null,
            ].filter(Boolean).join(" ") || undefined}
            onKeyDown={syncCapsLock}
            onKeyUp={syncCapsLock}
            onBlur={(event) => {
              passwordRegistration.onBlur(event);
              setCapsLockActive(false);
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? translations.hidePassword : translations.showPassword}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {capsLockActive ? (
          <p id="password-caps-lock" className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
            {translations.capsLockWarning}
          </p>
        ) : null}
        {passwordError && (
          <p id="password-error" className="text-sm text-destructive">
            {String(passwordError)}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? translations.signingIn : translations.signIn}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          disabled={isSubmitting}
        >
          {translations.forgotPassword}
        </button>
      </div>
    </form>
  );
}


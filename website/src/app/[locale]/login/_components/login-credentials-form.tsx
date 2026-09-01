"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  };
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
}) {
  const usernameError = errors.username?.message;
  const passwordError = errors.password?.message;

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
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder={translations.passwordPlaceholder}
          className="bg-background text-foreground placeholder:text-muted-foreground"
          autoComplete="current-password"
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? "password-error" : undefined}
        />
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


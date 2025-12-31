"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginCredentialsForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  isSubmitting,
  translations,
}: {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
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
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">{translations.usernameLabel}</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder={translations.usernamePlaceholder}
          required
          autoFocus
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{translations.passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder={translations.passwordPlaceholder}
          required
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? translations.signingIn : translations.signIn}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:underline"
          disabled={isSubmitting}
        >
          {translations.forgotPassword}
        </button>
      </div>
    </form>
  );
}


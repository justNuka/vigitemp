"use client";

import { AnimatePresence, m } from "motion/react";
import { Eye, EyeOff, Keyboard } from "lucide-react";
import { useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const inputClass =
    "h-9 rounded-md border-border bg-card text-[13px] shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-muted-foreground hover:border-[hsl(var(--border-strong))] focus-visible:border-primary/55 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-xs font-medium text-foreground/85">
          {translations.usernameLabel}
        </Label>
        <Input
          id="username"
          type="text"
          {...register("username")}
          placeholder={translations.usernamePlaceholder}
          className={inputClass}
          autoFocus
          autoComplete="username"
          aria-invalid={!!usernameError}
          aria-describedby={usernameError ? "username-error" : undefined}
        />
        <AnimatePresence initial={false}>
          {usernameError ? (
            <m.p
              id="username-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden text-xs text-destructive"
            >
              {String(usernameError)}
            </m.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-medium text-foreground/85">
          {translations.passwordLabel}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...passwordRegistration}
            placeholder={translations.passwordPlaceholder}
            className={`${inputClass} pr-11`}
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
            className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[hsl(var(--subtle-foreground))] transition-colors duration-150 hover:bg-[hsl(var(--surface-sunken))] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            aria-label={showPassword ? translations.hidePassword : translations.showPassword}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {capsLockActive ? (
            <m.p
              id="password-caps-lock"
              role="status"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center gap-1.5 overflow-hidden text-xs font-medium text-[hsl(var(--status-warning-text))]"
            >
              <Keyboard className="h-3.5 w-3.5" aria-hidden />
              {translations.capsLockWarning}
            </m.p>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {passwordError ? (
            <m.p
              id="password-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden text-xs text-destructive"
            >
              {String(passwordError)}
            </m.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="rounded-md px-1.5 py-1 text-xs font-medium text-[hsl(var(--primary-strong))] transition-colors duration-150 hover:bg-[hsl(var(--primary-soft))] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          disabled={isSubmitting}
        >
          {translations.forgotPassword}
        </button>
      </div>

      <Button
        type="submit"
        className="h-9 w-full text-[13px] font-semibold shadow-sm transition-[transform,box-shadow,background-color] duration-150 active:translate-y-px"
        disabled={isSubmitting}
      >
        {isSubmitting ? translations.signingIn : translations.signIn}
      </Button>
    </form>
  );
}

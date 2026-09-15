"use client";

import { AlertTriangle, BookOpen, ExternalLink, KeyRound, Mail, Server } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SMTPConfigurationGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SmtpSetting({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border bg-muted/20 px-3 py-2 sm:grid-cols-[140px_1fr] sm:items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <code className="break-all text-sm">{value}</code>
    </div>
  );
}

function DocumentationLink({ href, label }: { href: string; label: string }) {
  return (
    <Button type="button" variant="outline" size="sm" asChild>
      <a href={href} target="_blank" rel="noreferrer">
        {label}
        <ExternalLink className="ml-2 h-3.5 w-3.5" />
      </a>
    </Button>
  );
}

export function SMTPConfigurationGuideDialog({ open, onOpenChange }: SMTPConfigurationGuideDialogProps) {
  const t = useTranslations("adminSettings.smtp_guide");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border bg-white shadow-xl dark:bg-background sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Alert className="border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-100">
          <KeyRound className="h-4 w-4" />
          <AlertDescription>
            <strong>{t("compatibility_title")} :</strong> {t("compatibility_body")}
          </AlertDescription>
        </Alert>

        <div className="space-y-5">
          <section className="space-y-3 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-semibold">{t("google.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("google.summary")}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <SmtpSetting label={t("host")} value="smtp.gmail.com" />
              <SmtpSetting label={t("port")} value="587" />
              <SmtpSetting label={t("security")} value="STARTTLS" />
              <SmtpSetting label={t("user")} value={t("full_email")} />
              <SmtpSetting label={t("sender")} value={t("same_email")} />
              <SmtpSetting label={t("password")} value={t("google.password")} />
            </div>
            <p className="text-sm leading-6">{t("google.steps")}</p>
            <Alert className="border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t("google.warning")}</AlertDescription>
            </Alert>
            <DocumentationLink
              href="https://support.google.com/mail/answer/185833"
              label={t("documentation")}
            />
          </section>

          <section className="space-y-3 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-semibold">{t("microsoft.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("microsoft.summary")}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <SmtpSetting label={t("host")} value="smtp.office365.com" />
              <SmtpSetting label={t("port")} value="587" />
              <SmtpSetting label={t("security")} value="STARTTLS" />
              <SmtpSetting label={t("user")} value={t("full_email")} />
              <SmtpSetting label={t("sender")} value={t("same_email")} />
            </div>
            <p className="text-sm leading-6">{t("microsoft.checks")}</p>
            <p className="rounded-md border bg-muted/20 p-3 text-sm">{t("microsoft.outlook")}</p>
            <Alert className="border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t("microsoft.oauth_warning")}</AlertDescription>
            </Alert>
            <DocumentationLink
              href="https://learn.microsoft.com/exchange/mail-flow-best-practices/how-to-set-up-a-multifunction-device-or-application-to-send-email-using-microsoft-365-or-office-365"
              label={t("documentation")}
            />
          </section>

          <section className="space-y-3 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <Server className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-semibold">{t("alwaysdata.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("alwaysdata.summary")}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <SmtpSetting label={t("host")} value="smtp-[account].alwaysdata.net" />
              <SmtpSetting label={t("port")} value="465 SSL/TLS / 587 STARTTLS" />
              <SmtpSetting label={t("user")} value={t("full_email")} />
              <SmtpSetting label={t("sender")} value={t("same_email")} />
              <SmtpSetting label={t("password")} value={t("alwaysdata.password")} />
            </div>
            <p className="text-sm leading-6">{t("alwaysdata.steps")}</p>
            <p className="text-xs text-muted-foreground">{t("alwaysdata.ports")}</p>
            <DocumentationLink
              href="https://help.alwaysdata.com/fr/docs/emails/utiliser-une-adresse-email/"
              label={t("documentation")}
            />
          </section>

          <section className="space-y-3 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <Server className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-semibold">{t("generic.title")}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{t("generic.summary")}</p>
              </div>
            </div>
          </section>
        </div>

        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>{t("test_title")} :</strong> {t("test_body")}
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

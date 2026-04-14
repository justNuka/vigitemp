"use client";

import { useEffect, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { DatabaseZap, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type TemporaryMemoryControlsProps<TFormValues extends FieldValues> = {
  form: UseFormReturn<TFormValues>;
  storageKey: string;
  resetValues: TFormValues;
  labels: {
    save: string;
    clear: string;
    restore: string;
    saved: string;
  };
};

export function TemporaryMemoryControls<TFormValues extends FieldValues>({
  form,
  storageKey,
  resetValues,
  labels,
}: TemporaryMemoryControlsProps<TFormValues>) {
  const [hasStoredDraft, setHasStoredDraft] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncTimer = window.setTimeout(() => {
      setHasStoredDraft(Boolean(window.localStorage.getItem(storageKey)));
    }, 0);

    return () => {
      window.clearTimeout(syncTimer);
    };
  }, [storageKey]);

  const saveDraft = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(form.getValues()));
    setHasStoredDraft(true);
  };

  const restoreDraft = () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      form.reset(JSON.parse(raw) as TFormValues);
    } catch {
      window.localStorage.removeItem(storageKey);
      setHasStoredDraft(false);
    }
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    setHasStoredDraft(false);
    form.reset(resetValues);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed bg-muted/30 px-3 py-2">
      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={saveDraft}>
        <DatabaseZap className="h-4 w-4" />
        {labels.save}
      </Button>
      {hasStoredDraft ? (
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={restoreDraft}>
          <RotateCcw className="h-4 w-4" />
          {labels.restore}
        </Button>
      ) : null}
      <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={clearDraft}>
        <Trash2 className="h-4 w-4" />
        {labels.clear}
      </Button>
      {hasStoredDraft ? <span className="text-xs text-muted-foreground">{labels.saved}</span> : null}
    </div>
  );
}

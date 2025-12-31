"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordField({
  id,
  label,
  inputProps,
  disabled = false,
  required = false,
  hideLabel = false,
  className,
  toggleLabelShow = "Afficher",
  toggleLabelHide = "Masquer",
}: {
  id: string;
  label: string;
  inputProps?: React.ComponentProps<typeof Input>;
  disabled?: boolean;
  required?: boolean;
  hideLabel?: boolean;
  className?: string;
  toggleLabelShow?: string;
  toggleLabelHide?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      {!hideLabel && <Label htmlFor={id}>{label}</Label>}
      <div className={hideLabel ? "relative" : "relative mt-2"}>
        <Input
          id={id}
          {...inputProps}
          type={visible ? "text" : "password"}
          required={required}
          disabled={disabled}
          aria-label={hideLabel ? label : inputProps?.["aria-label"]}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? toggleLabelHide : toggleLabelShow}
          title={visible ? toggleLabelHide : toggleLabelShow}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

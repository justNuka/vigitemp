import type { FieldErrors, FieldValues } from "react-hook-form"
import { toast } from "sonner"

function getFirstErrorMessage(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined

  const candidate = value as Record<string, unknown>
  const directMessage = candidate.message
  if (typeof directMessage === "string" && directMessage.trim().length > 0) {
    return directMessage
  }

  for (const nested of Object.values(candidate)) {
    const nestedMessage = getFirstErrorMessage(nested)
    if (nestedMessage) return nestedMessage
  }

  return undefined
}

export function showFormValidationToast<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
  fallback = "Veuillez corriger les champs du formulaire.",
) {
  const message = getFirstErrorMessage(errors)
  toast.warning(message ?? fallback)
}

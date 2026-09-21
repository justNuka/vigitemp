export type CriticalThresholdField =
  | "Seuil_Critique_Haut"
  | "Seuil_Critique_Bas"

export type CriticalThresholdIssue = {
  code: "custom"
  path: [CriticalThresholdField]
  message: string
}

export type CriticalThresholdValues = {
  consigne?: number | null
  effectiveHigh?: number | null
  effectiveLow?: number | null
  criticalHigh?: number | null
  criticalHighActive?: boolean | null
  criticalLow?: number | null
  criticalLowActive?: boolean | null
}

function finiteNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function buildCriticalThresholdIssues(
  values: CriticalThresholdValues,
  locale: "fr" | "en" = "fr",
): CriticalThresholdIssue[] {
  const issues: CriticalThresholdIssue[] = []
  const consigne = finiteNumber(values.consigne)
  const effectiveHigh = finiteNumber(values.effectiveHigh)
  const effectiveLow = finiteNumber(values.effectiveLow)
  const criticalHigh = finiteNumber(values.criticalHigh)
  const criticalLow = finiteNumber(values.criticalLow)
  const highActive = values.criticalHighActive === true
  const lowActive = values.criticalLowActive === true

  if (highActive && criticalHigh === null) {
    issues.push({
      code: "custom",
      path: ["Seuil_Critique_Haut"],
      message:
        locale === "en"
          ? "The critical upper threshold is required when it is enabled."
          : "Le seuil critique haut est requis lorsqu'il est activé.",
    })
  }

  if (lowActive && criticalLow === null) {
    issues.push({
      code: "custom",
      path: ["Seuil_Critique_Bas"],
      message:
        locale === "en"
          ? "The critical lower threshold is required when it is enabled."
          : "Le seuil critique bas est requis lorsqu'il est activé.",
    })
  }

  const highReference = effectiveHigh ?? consigne
  if (
    highActive &&
    criticalHigh !== null &&
    highReference !== null &&
    criticalHigh <= highReference
  ) {
    issues.push({
      code: "custom",
      path: ["Seuil_Critique_Haut"],
      message:
        locale === "en"
          ? "The critical upper threshold must be strictly above the normal upper alarm threshold."
          : "Le seuil critique haut doit être strictement supérieur au seuil d'alarme haut normal.",
    })
  }

  const lowReference = effectiveLow ?? consigne
  if (
    lowActive &&
    criticalLow !== null &&
    lowReference !== null &&
    criticalLow >= lowReference
  ) {
    issues.push({
      code: "custom",
      path: ["Seuil_Critique_Bas"],
      message:
        locale === "en"
          ? "The critical lower threshold must be strictly below the normal lower alarm threshold."
          : "Le seuil critique bas doit être strictement inférieur au seuil d'alarme bas normal.",
    })
  }

  if (
    highActive &&
    lowActive &&
    criticalHigh !== null &&
    criticalLow !== null &&
    criticalLow >= criticalHigh
  ) {
    issues.push({
      code: "custom",
      path: ["Seuil_Critique_Bas"],
      message:
        locale === "en"
          ? "The critical lower threshold must be strictly below the critical upper threshold."
          : "Le seuil critique bas doit être strictement inférieur au seuil critique haut.",
    })
  }

  return issues
}

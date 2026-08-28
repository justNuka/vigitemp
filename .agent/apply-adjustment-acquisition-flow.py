from pathlib import Path

ROOT = Path('.')


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding='utf-8')


def write(path: str, content: str) -> None:
    (ROOT / path).write_text(content, encoding='utf-8')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected 1 occurrence, found {count}')
    return text.replace(old, new, 1)


def replace_between(text: str, start: str, end: str, replacement: str, label: str) -> str:
    start_index = text.find(start)
    if start_index < 0:
        raise RuntimeError(f'{label}: start marker not found')
    end_index = text.find(end, start_index)
    if end_index < 0:
        raise RuntimeError(f'{label}: end marker not found')
    return text[:start_index] + replacement + text[end_index:]


# ---------------------------------------------------------------------------
# Backend session engine
# ---------------------------------------------------------------------------
path = 'website/src/lib/metrology-adjustment-session.ts'
text = read(path)

text = replace_once(
    text,
    '''type RunningPoint = {\n  pointIndex: PointIndex\n  startedAt: number | null\n  standardSamples: PlateauSample[]\n  sensorSamples: Record<number, PlateauSample[]>\n  lastStandardValue: number | null\n}\n''',
    '''type RunningPoint = {\n  pointIndex: PointIndex\n  startedAt: number\n  targetValue: number | null\n  standardSamples: PlateauSample[]\n  sensorSamples: Record<number, PlateauSample[]>\n  lastStandardValue: number | null\n}\n''',
    'RunningPoint type',
)

text = replace_once(
    text,
    '''  currentPoint: RunningPoint | null\n  plateauStatus: PlateauStatus\n  validatedPoints: Partial<Record<PointIndex, ValidatedPoint>>\n''',
    '''  currentPoint: RunningPoint | null\n  plateauStatus: PlateauStatus\n  coefficientsLocked: boolean\n  validatedPoints: Partial<Record<PointIndex, ValidatedPoint>>\n''',
    'AdjustmentSession coefficientsLocked',
)

text = replace_once(
    text,
    '''  plateauStatus: PlateauStatus\n  validatedPoints: Partial<Record<PointIndex, ValidatedPoint>>\n  message: string | null\n''',
    '''  plateauStatus: PlateauStatus\n  coefficientsLocked: boolean\n  validatedPoints: Partial<Record<PointIndex, ValidatedPoint>>\n  message: string | null\n''',
    'PublicSession coefficientsLocked',
)

text = replace_once(
    text,
    '''    plateauStatus: session.plateauStatus,\n    validatedPoints: session.validatedPoints,\n''',
    '''    plateauStatus: session.plateauStatus,\n    coefficientsLocked: session.coefficientsLocked,\n    validatedPoints: session.validatedPoints,\n''',
    'toPublicSession coefficientsLocked',
)

text = replace_once(
    text,
    '''function createRunningPoint(pointIndex: PointIndex): RunningPoint {\n  return {\n    pointIndex,\n    startedAt: null,\n    standardSamples: [],\n    sensorSamples: {},\n    lastStandardValue: null,\n  }\n}\n''',
    '''function createRunningPoint(\n  pointIndex: PointIndex,\n  startedAt: number,\n  targetValue: number | null = null,\n): RunningPoint {\n  return {\n    pointIndex,\n    startedAt,\n    targetValue,\n    standardSamples: [],\n    sensorSamples: {},\n    lastStandardValue: null,\n  }\n}\n''',
    'createRunningPoint',
)

text = replace_once(
    text,
    '''    latestStandardReading: null,\n    latestSensorReadings: {},\n    currentPoint: createRunningPoint(1),\n    plateauStatus: standardIsExternal\n      ? {\n          ...createWaitingPlateauStatus(1, Math.max(0, input.plateauMaxGap)),\n          status: "idle",\n        }\n      : createWaitingPlateauStatus(1, Math.max(0, input.plateauMaxGap)),\n    validatedPoints: {},\n    message: standardIsExternal\n      ? "Séquence d'ajustage demarrée. Saisissez le premier point lorsque les mesures des sondes sont disponibles."\n      : "Séquence d'ajustage demarrée. Attente de la première mesure étalon du point 1.",\n''',
    '''    latestStandardReading: null,\n    latestSensorReadings: {},\n    currentPoint: null,\n    plateauStatus: {\n      ...createWaitingPlateauStatus(1, Math.max(0, input.plateauMaxGap)),\n      status: "idle",\n    },\n    coefficientsLocked: false,\n    validatedPoints: {},\n    message: standardIsExternal\n      ? "Séquence d'ajustage démarrée. Lecture des sondes active ; lancez l'acquisition du premier point lorsque vous êtes prêt."\n      : "Séquence d'ajustage démarrée. Lecture continue des sondes et de l'étalon active ; lancez l'acquisition du premier point lorsque vous êtes prêt.",\n''',
    'initial adjustment session state',
)

apply_start = text.find('function applyStandardReadingToPlateau(')
run_loop_start = text.find('async function runOneLoop(', apply_start)
if apply_start < 0 or run_loop_start < 0:
    raise RuntimeError('plateau function markers not found')
new_plateau = '''function applyStandardReadingToPlateau(session: AdjustmentSession, reading: RuntimeReading) {\n  if (!session.currentPoint || reading.value == null) return\n\n  const currentPoint = session.currentPoint\n  const sample = {\n    measuredAt: reading.measuredAt,\n    value: reading.value,\n    rawValue: reading.rawValue,\n  }\n  const previousStandardValue = currentPoint.lastStandardValue\n  const measuredGap =\n    previousStandardValue == null ? null : Math.abs(reading.value - previousStandardValue)\n\n  if (measuredGap != null && measuredGap > session.plateauMaxGap) {\n    const restartedAt = Date.now()\n    currentPoint.startedAt = restartedAt\n    currentPoint.standardSamples = [sample]\n    currentPoint.sensorSamples = {}\n    currentPoint.lastStandardValue = reading.value\n    session.plateauStatus = {\n      status: "running",\n      pointIndex: currentPoint.pointIndex,\n      startedAt: new Date(restartedAt).toISOString(),\n      endedAt: null,\n      standardSampleCount: 1,\n      lastGap: measuredGap,\n      maxGap: session.plateauMaxGap,\n      resetCount: session.plateauStatus.resetCount + 1,\n      lastResetAt: new Date(restartedAt).toISOString(),\n    }\n    session.message =\n      `Plateau du point ${currentPoint.pointIndex} redémarré : ` +\n      `écart ${measuredGap} supérieur au maximum ${session.plateauMaxGap}.`\n  } else {\n    currentPoint.standardSamples.push(sample)\n    currentPoint.lastStandardValue = reading.value\n    session.plateauStatus = {\n      ...session.plateauStatus,\n      status: "running",\n      standardSampleCount: currentPoint.standardSamples.length,\n      lastGap: measuredGap,\n    }\n  }\n\n  session.lastError = null\n  session.lastUpdatedAt = nowIso()\n}\n\nasync function completeAdjustmentPoint(session: AdjustmentSession) {\n  const currentPoint = session.currentPoint\n  if (!currentPoint) return\n\n  const pointIndex = currentPoint.pointIndex\n  const standardAverage = session.standardIsExternal\n    ? roundValue(currentPoint.targetValue, session.displayDecimals)\n    : averageValues(\n        currentPoint.standardSamples.map((sample) => sample.value),\n        session.displayDecimals,\n      )\n\n  if (standardAverage == null) {\n    throw new Error(`Aucune mesure étalon exploitable pour le point ${pointIndex}.`)\n  }\n\n  const sensorAverages: Record<number, number | null> = {}\n  for (const sensor of session.sensors) {\n    const sensorAverage = averageValues(\n      (currentPoint.sensorSamples[sensor.id] ?? []).map((sample) => sample.value),\n      session.displayDecimals,\n    )\n    if (sensorAverage == null) {\n      throw new Error(`Aucune mesure exploitable pour la sonde ${sensor.serialNumber}.`)\n    }\n    sensorAverages[sensor.id] = sensorAverage\n  }\n\n  const completedAt = nowIso()\n  session.validatedPoints[pointIndex] = {\n    pointIndex,\n    targetValue: standardAverage,\n    startedAt: new Date(currentPoint.startedAt).toISOString(),\n    completedAt,\n    standardAverage,\n    sensorAverages,\n  }\n  session.plateauStatus = {\n    ...session.plateauStatus,\n    status: "validated",\n    endedAt: completedAt,\n  }\n  session.currentPoint = null\n  session.message = `Point ${pointIndex} validé automatiquement avec la moyenne du plateau.`\n  session.lastError = null\n  session.lastUpdatedAt = completedAt\n\n  if (pointIndex === 2) {\n    await finalizeSession(session, "completed", "Les deux points d'ajustage sont validés automatiquement.")\n  }\n}\n\n'''
text = text[:apply_start] + new_plateau + text[run_loop_start:]

plateau_tail_start = text.find('  const plateauDurationMs = session.plateauDurationMinutes * 60_000', text.find('async function runOneLoop('))
schedule_start = text.find('async function scheduleLoop(', plateau_tail_start)
if plateau_tail_start < 0 or schedule_start < 0:
    raise RuntimeError('runOneLoop plateau tail markers not found')
new_tail = '''  const plateauDurationMs = session.plateauDurationMinutes * 60_000\n  if (Date.now() - session.currentPoint.startedAt < plateauDurationMs) {\n    session.lastUpdatedAt = nowIso()\n    return\n  }\n\n  const currentPoint = session.currentPoint\n  const pointIndex = currentPoint.pointIndex\n  const validStandardSampleCount = currentPoint.standardSamples.filter((sample) => sample.value != null).length\n  const sensorsWithoutSample = session.sensors.filter(\n    (sensor) => !(currentPoint.sensorSamples[sensor.id] ?? []).some((sample) => sample.value != null),\n  )\n  const missingStandardSamples = !session.standardIsExternal && validStandardSampleCount < 2\n\n  if (missingStandardSamples || sensorsWithoutSample.length > 0) {\n    const pendingParts: string[] = []\n    if (missingStandardSamples) {\n      pendingParts.push(`${2 - validStandardSampleCount} mesure(s) étalon`)\n    }\n    if (sensorsWithoutSample.length > 0) {\n      pendingParts.push(`${sensorsWithoutSample.length} sonde(s)`)\n    }\n    session.plateauStatus = {\n      ...session.plateauStatus,\n      status: "waiting",\n      standardSampleCount: validStandardSampleCount,\n    }\n    session.message = `Plateau terminé pour le point ${pointIndex}, attente de ${pendingParts.join(" et ")}.`\n    session.lastError = null\n    session.lastUpdatedAt = nowIso()\n    return\n  }\n\n  await completeAdjustmentPoint(session)\n}\n\n'''
text = text[:plateau_tail_start] + new_tail + text[schedule_start:]

text = replace_once(
    text,
    '''  if (session.stopRequested || session.status !== "running") return\n  if (session.plateauStatus.status === "ready") return\n  const elapsedMs = Date.now() - loopStartedAt\n''',
    '''  if (session.stopRequested || session.status !== "running") return\n  const elapsedMs = Date.now() - loopStartedAt\n''',
    'scheduleLoop continuous reads',
)

text = replace_once(
    text,
    '''  if (!session || session.status !== "running") {\n    throw new Error("Aucun ajustage en cours.")\n  }\n  if (updates.length === 0) {\n''',
    '''  if (!session || session.status !== "running") {\n    throw new Error("Aucun ajustage en cours.")\n  }\n  if (session.coefficientsLocked) {\n    throw new Error("Les coefficients sont verrouillés depuis le lancement de l'acquisition du premier point.")\n  }\n  if (updates.length === 0) {\n''',
    'coefficient backend lock',
)

validation_start = text.find('export async function validateAdjustmentPoint(')
external_start = text.find('export async function submitExternalStandardReading(', validation_start)
if validation_start < 0 or external_start < 0:
    raise RuntimeError('validateAdjustmentPoint markers not found')
new_start_acquisition = '''export async function startAdjustmentPointAcquisition(\n  userId: number,\n  pointIndex: PointIndex,\n  targetValue?: number,\n) {\n  const session = sessionsByUserId.get(userId)\n  if (!session) throw new Error("Aucune session d'ajustage en cours.")\n  if (session.status !== "running") throw new Error("La session d'ajustage n'est plus active.")\n  if (session.currentPoint) {\n    throw new Error(`L'acquisition du point ${session.currentPoint.pointIndex} est déjà en cours.`)\n  }\n  if (pointIndex === 1 && session.validatedPoints[1]) {\n    throw new Error("Le premier point a déjà été validé.")\n  }\n  if (pointIndex === 2 && !session.validatedPoints[1]) {\n    throw new Error("Le premier point doit être validé avant de lancer le second.")\n  }\n  if (session.validatedPoints[pointIndex]) {\n    throw new Error(`Le point ${pointIndex} a déjà été validé.`)\n  }\n\n  const unavailableSensors = session.sensors.filter(\n    (sensor) => !Number.isFinite(session.latestSensorReadings[sensor.id]?.value),\n  )\n  if (unavailableSensors.length > 0) {\n    throw new Error(\n      `Attendez une mesure valide pour ${unavailableSensors.length} sonde(s) avant de lancer l'acquisition.`,\n    )\n  }\n  if (!session.standardIsExternal && !Number.isFinite(session.latestStandardReading?.value)) {\n    throw new Error("Attendez une mesure valide de l'étalon avant de lancer l'acquisition.")\n  }\n  if (session.standardIsExternal && !Number.isFinite(targetValue)) {\n    throw new Error("La valeur du point étalon externe doit être renseignée.")\n  }\n\n  const startedAt = Date.now()\n  session.currentPoint = createRunningPoint(\n    pointIndex,\n    startedAt,\n    session.standardIsExternal ? Number(targetValue) : null,\n  )\n  session.plateauStatus = {\n    status: "running",\n    pointIndex,\n    startedAt: new Date(startedAt).toISOString(),\n    endedAt: null,\n    standardSampleCount: 0,\n    lastGap: null,\n    maxGap: session.plateauMaxGap,\n    resetCount: session.plateauStatus.resetCount,\n    lastResetAt: null,\n  }\n  if (pointIndex === 1) {\n    session.coefficientsLocked = true\n  }\n  session.message = `Acquisition du point ${pointIndex} lancée. Le plateau de stabilité est en cours.`\n  session.lastError = null\n  session.lastUpdatedAt = nowIso()\n\n  if (session.standardIsExternal) {\n    for (const sensor of session.sensors) {\n      const reading = session.latestSensorReadings[sensor.id]\n      if (!reading || reading.value == null) continue\n      session.currentPoint.sensorSamples[sensor.id] = [{\n        measuredAt: reading.measuredAt,\n        value: reading.value,\n        rawValue: reading.rawValue,\n      }]\n    }\n    await completeAdjustmentPoint(session)\n    return toPublicSession(session)\n  }\n\n  if (session.loopTimer) {\n    clearTimeout(session.loopTimer)\n    session.loopTimer = null\n  }\n  void scheduleLoop(session)\n  return toPublicSession(session)\n}\n\n'''
text = text[:validation_start] + new_start_acquisition + text[external_start:]

write(path, text)


# ---------------------------------------------------------------------------
# Point API: POST now starts an acquisition. Validation happens automatically.
# ---------------------------------------------------------------------------
path = 'website/src/app/api/metrologie/ajustage/session/point/route.ts'
text = read(path)
text = replace_once(
    text,
    'import { validateAdjustmentPoint } from "@/lib/metrology-adjustment-session"\nimport { restoreGspMetrologyConfigurationOnce } from "@/lib/metrology-gsp-configuration-restore"\n',
    'import { startAdjustmentPointAcquisition } from "@/lib/metrology-adjustment-session"\n',
    'point route imports',
)
text = replace_once(
    text,
    '''const pointSchema = z.object({\n  pointIndex: z.union([z.literal(1), z.literal(2)]),\n  targetValue: z.number(),\n})\n''',
    '''const pointSchema = z.object({\n  pointIndex: z.union([z.literal(1), z.literal(2)]),\n  targetValue: z.number().finite().optional(),\n})\n''',
    'point route schema',
)
text = replace_once(
    text,
    '''      const session = await validateAdjustmentPoint(ctx.user.userId, data.pointIndex, data.targetValue)\n      if (session.status !== "running" && session.status !== "idle") {\n        await restoreGspMetrologyConfigurationOnce(\n          `adjustment:${session.id}`,\n          session.sensors.map((sensor) => sensor.id),\n          "AJUSTAGE",\n        )\n      }\n      return apiOk({ session })\n''',
    '''      const session = await startAdjustmentPointAcquisition(\n        ctx.user.userId,\n        data.pointIndex,\n        data.targetValue,\n      )\n      return apiOk({ session })\n''',
    'point route handler',
)
text = text.replace('"point_validation_failed"', '"point_acquisition_failed"')
text = text.replace('"adjustment_point_validation_failed"', '"adjustment_point_acquisition_failed"')
text = text.replace('"Impossible de valider le point"', '"Impossible de lancer l\'acquisition du point"')
write(path, text)


# ---------------------------------------------------------------------------
# Adjustment frontend
# ---------------------------------------------------------------------------
path = 'website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx'
text = read(path)

text = replace_once(
    text,
    'import type { MetrologyPreviewReading } from "@/lib/metrology-reading-preview"\n',
    '',
    'remove adjustment preview import',
)

text = replace_once(
    text,
    '''    standardSerial: string\n    standardIsExternal: boolean\n    sensors: Array<{\n''',
    '''    standardSerial: string\n    standardIsExternal: boolean\n    coefficientsLocked: boolean\n    sensors: Array<{\n''',
    'frontend coefficientsLocked type',
)

text = replace_once(
    text,
    '''  const [actionError, setActionError] = useState<string | null>(null)\n  const [showStopConfirm, setShowStopConfirm] = useState(false)\n  const [previewReadingEnabled, setPreviewReadingEnabled] = useState(false)\n''',
    '''  const [actionError, setActionError] = useState<string | null>(null)\n  const [showStopConfirm, setShowStopConfirm] = useState(false)\n  const [showFirstPointConfirm, setShowFirstPointConfirm] = useState(false)\n  const [showCalculationDetails, setShowCalculationDetails] = useState(false)\n''',
    'frontend states',
)

preview_start = text.find('  const previewIntervalMs =')
validated_marker = '  const validatedPoints = {'
preview_end = text.find(validated_marker, preview_start)
if preview_start < 0 or preview_end < 0:
    raise RuntimeError('preview query markers not found')
text = text[:preview_start] + '''  const signalReadings = useMemo(\n    () => (isAdjustmentRunning ? session?.latestSensorReadings ?? {} : {}),\n    [isAdjustmentRunning, session?.latestSensorReadings],\n  )\n''' + text[preview_end:]

ready_start = text.find('  const allSensorReadingsAvailable = Boolean(')
latest_standard_marker = '  const latestStandardMeasure ='
ready_end = text.find(latest_standard_marker, ready_start)
if ready_start < 0 or ready_end < 0:
    raise RuntimeError('point readiness markers not found')
new_readiness = '''  const allSensorReadingsAvailable = Boolean(\n    session?.sensors.length &&\n      session.sensors.every((sensor) => Number.isFinite(session.latestSensorReadings[sensor.id]?.value)),\n  )\n  const pointOneManualValue = Number(pointOne.trim().replace(",", "."))\n  const pointTwoManualValue = Number(pointTwo.trim().replace(",", "."))\n  const coefficientsLocked = Boolean(session?.coefficientsLocked)\n  const activeAcquisitionPoint = session?.currentPoint?.pointIndex ?? null\n  const hasReadableStandard = isExternalSession\n    ? true\n    : Number.isFinite(session?.latestStandardReading?.value)\n  const canStartPointOneAcquisition = Boolean(\n    isAdjustmentRunning &&\n      !validatedPoints.pointOne &&\n      activeAcquisitionPoint == null &&\n      allSensorReadingsAvailable &&\n      hasReadableStandard &&\n      (!isExternalSession || (pointOne.trim().length > 0 && Number.isFinite(pointOneManualValue))),\n  )\n  const canStartPointTwoAcquisition = Boolean(\n    isAdjustmentRunning &&\n      validatedPoints.pointOne &&\n      !validatedPoints.pointTwo &&\n      activeAcquisitionPoint == null &&\n      allSensorReadingsAvailable &&\n      hasReadableStandard &&\n      (!isExternalSession || (pointTwo.trim().length > 0 && Number.isFinite(pointTwoManualValue))),\n  )\n'''
text = text[:ready_start] + new_readiness + text[ready_end:]

text = replace_once(
    text,
    '''    onSuccess: async () => {\n      setActionError(null)\n      setPointOne("")\n      setPointTwo("")\n      setDirection(1)\n      setStep("adjustment")\n      await refreshSession()\n    },\n''',
    '''    onSuccess: async () => {\n      setActionError(null)\n      setPointOne("")\n      setPointTwo("")\n      setShowCalculationDetails(false)\n      setDirection(1)\n      setStep("adjustment")\n      await refreshSession()\n    },\n''',
    'start operation success',
)

mutation_start = text.find('  const validatePointMutation = useMutation({')
mutation_end = text.find('  useEffect(() => {', mutation_start)
if mutation_start < 0 or mutation_end < 0:
    raise RuntimeError('validate point mutation markers not found')
new_mutation = '''  const startPointAcquisitionMutation = useMutation({\n    mutationFn: async (payload: { pointIndex: 1 | 2; targetValue?: number }) =>\n      fetchJson<{ session: SessionApiPayload["session"] }>("/api/metrologie/ajustage/session/point", {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify(payload),\n      }),\n    onSuccess: async () => {\n      setActionError(null)\n      setShowFirstPointConfirm(false)\n      await refreshSession()\n    },\n    onError: (error) => {\n      setActionError(error instanceof Error ? error.message : String(error))\n      setShowFirstPointConfirm(false)\n    },\n  })\n\n'''
text = text[:mutation_start] + new_mutation + text[mutation_end:]

# Remove preview reset when navigating back.
text = text.replace('                    setPreviewReadingEnabled(false)\n', '')

# Remove the standalone reading button/status block by locating its unique toggle code.
toggle_index = text.find('                            if (previewReadingEnabled) {')
if toggle_index < 0:
    raise RuntimeError('preview button toggle not found')
preview_button_start = text.rfind('                        <Button', 0, toggle_index)
next_button = text.find('                        <Button', toggle_index + 1)
if preview_button_start < 0 or next_button < 0:
    raise RuntimeError('preview button boundaries not found')
text = text[:preview_button_start] + text[next_button:]
text = text.replace(': !canRunAdjustment || previewReadingQuery.isFetching', ': !canRunAdjustment')
text = text.replace('                            setPreviewReadingEnabled(false)\n                            startMutation.mutate()', '                            startMutation.mutate()')

# Coefficient fields remain editable only until acquisition point 1 starts.
text = text.replace('readOnly={!isAdjustmentRunning}', 'readOnly={!isAdjustmentRunning || coefficientsLocked}')
text = text.replace('if (!isAdjustmentRunning) return', 'if (!isAdjustmentRunning || coefficientsLocked) return')
text = text.replace('disabled={updateCoefficientsMutation.isPending}', 'disabled={updateCoefficientsMutation.isPending || coefficientsLocked}')

coeff_action_marker = '''                        {isAdjustmentRunning && session ? (\n                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">\n'''
if coeff_action_marker not in text:
    raise RuntimeError('coefficient action marker not found')
text = text.replace(
    coeff_action_marker,
    '''                        {coefficientsLocked ? (\n                          <Alert className="border-amber-300 bg-amber-50 text-amber-950">\n                            <BadgeInfo className="h-4 w-4" />\n                            <AlertTitle>{t("adjustment.cards.coefficients.lockedTitle")}</AlertTitle>\n                            <AlertDescription>{t("adjustment.cards.coefficients.lockedDescription")}</AlertDescription>\n                          </Alert>\n                        ) : null}\n                        {isAdjustmentRunning && session ? (\n                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">\n''',
    1,
)

# Replace the point card with explicit acquisition actions.
point_card_start_marker = '''                    <Card>\n                      <CardHeader>\n                        <CardTitle>{t("adjustment.cards.points.title")}</CardTitle>\n'''
point_card_start = text.find(point_card_start_marker)
standard_card_marker = '''                    <Card\n                      className={\n                        usesExternalStandard\n'''
point_card_end = text.find(standard_card_marker, point_card_start)
if point_card_start < 0 or point_card_end < 0:
    raise RuntimeError('point card boundaries not found')
new_point_card = '''                    <Card>\n                      <CardHeader>\n                        <CardTitle>{t("adjustment.cards.points.title")}</CardTitle>\n                        <CardDescription>{t("adjustment.cards.points.description")}</CardDescription>\n                      </CardHeader>\n                      <CardContent className="space-y-4">\n                        <div className="flex items-end gap-2">\n                          <div className="flex-1 space-y-2">\n                            <Label htmlFor="adjustment-point-one">{t("adjustment.cards.points.pointOne")}</Label>\n                            <Input\n                              id="adjustment-point-one"\n                              value={\n                                session?.validatedPoints?.[1]?.targetValue != null\n                                  ? formatDecimalDisplay(session.validatedPoints[1].targetValue)\n                                  : pointOne\n                              }\n                              readOnly={!isExternalSession}\n                              onChange={(event) => setPointOne(event.target.value)}\n                              disabled={!isAdjustmentRunning || Boolean(session?.validatedPoints?.[1]) || activeAcquisitionPoint === 1}\n                            />\n                          </div>\n                          <Button\n                            type="button"\n                            variant="outline"\n                            disabled={!canStartPointOneAcquisition || startPointAcquisitionMutation.isPending}\n                            onClick={() => {\n                              if (isExternalSession && !Number.isFinite(pointOneManualValue)) {\n                                setActionError(t("adjustment.cards.points.invalidValue"))\n                                return\n                              }\n                              setShowFirstPointConfirm(true)\n                            }}\n                          >\n                            {t("adjustment.cards.points.startFirstAcquisition")}\n                          </Button>\n                        </div>\n                        <div className="flex items-end gap-2">\n                          <div className="flex-1 space-y-2">\n                            <Label htmlFor="adjustment-point-two">{t("adjustment.cards.points.pointTwo")}</Label>\n                            <Input\n                              id="adjustment-point-two"\n                              value={\n                                session?.validatedPoints?.[2]?.targetValue != null\n                                  ? formatDecimalDisplay(session.validatedPoints[2].targetValue)\n                                  : pointTwo\n                              }\n                              readOnly={!isExternalSession}\n                              onChange={(event) => setPointTwo(event.target.value)}\n                              disabled={!isAdjustmentRunning || !validatedPoints.pointOne || Boolean(session?.validatedPoints?.[2]) || activeAcquisitionPoint === 2}\n                            />\n                          </div>\n                          <Button\n                            type="button"\n                            variant="outline"\n                            disabled={!canStartPointTwoAcquisition || startPointAcquisitionMutation.isPending}\n                            onClick={() => {\n                              if (isExternalSession && !Number.isFinite(pointTwoManualValue)) {\n                                setActionError(t("adjustment.cards.points.invalidValue"))\n                                return\n                              }\n                              startPointAcquisitionMutation.mutate({\n                                pointIndex: 2,\n                                targetValue: isExternalSession ? pointTwoManualValue : undefined,\n                              })\n                            }}\n                          >\n                            {t("adjustment.cards.points.startSecondAcquisition")}\n                          </Button>\n                        </div>\n                        {activeAcquisitionPoint ? (\n                          <p className="text-sm text-muted-foreground">\n                            {t("adjustment.cards.points.collecting", { point: activeAcquisitionPoint })}\n                          </p>\n                        ) : null}\n                      </CardContent>\n                    </Card>\n\n'''
text = text[:point_card_start] + new_point_card + text[point_card_end:]

# Remove obsolete READY UI; points are auto-validated at plateau end.
ready_ui = '''                        {session?.plateauStatus.status === "ready" ? (\n                          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 font-medium text-emerald-950">\n                            <CheckCircle2 className="size-5" />\n                            {session.message}\n                          </div>\n                        ) : null}\n'''
if ready_ui in text:
    text = text.replace(ready_ui, '', 1)

# Add calculation detail card after selected sensors table.
selected_card_end_marker = '''                  </Card>\n                </m.div>\n'''
insert_index = text.rfind(selected_card_end_marker)
if insert_index < 0:
    raise RuntimeError('selected sensors card end marker not found')
calc_card = '''                  </Card>\n\n                  {session?.validatedPoints?.[1] && session?.validatedPoints?.[2] ? (\n                    <Card>\n                      <CardHeader>\n                        <CardTitle>{t("adjustment.cards.calculation.title")}</CardTitle>\n                        <CardDescription>{t("adjustment.cards.calculation.description")}</CardDescription>\n                      </CardHeader>\n                      <CardContent className="space-y-4">\n                        <Button\n                          type="button"\n                          variant="outline"\n                          onClick={() => setShowCalculationDetails((current) => !current)}\n                        >\n                          {showCalculationDetails\n                            ? t("adjustment.cards.calculation.hideDetails")\n                            : t("adjustment.cards.calculation.showDetails")}\n                        </Button>\n\n                        {showCalculationDetails ? (\n                          <div className="space-y-4">\n                            {session.sensors.map((sensor) => {\n                              const pointOneResult = session.validatedPoints[1]\n                              const pointTwoResult = session.validatedPoints[2]\n                              if (!pointOneResult || !pointTwoResult) return null\n                              const rawOne = pointOneResult.sensorAverages[sensor.id]\n                              const rawTwo = pointTwoResult.sensorAverages[sensor.id]\n                              const standardOne = pointOneResult.standardAverage\n                              const standardTwo = pointTwoResult.standardAverage\n                              const denominator =\n                                rawOne != null && rawTwo != null ? rawTwo - rawOne : null\n                              const coeffA =\n                                denominator != null && denominator !== 0 && standardOne != null && standardTwo != null\n                                  ? (standardTwo - standardOne) / denominator\n                                  : null\n                              const coeffB =\n                                coeffA != null && rawOne != null && standardOne != null\n                                  ? standardOne - coeffA * rawOne\n                                  : null\n\n                              return (\n                                <div key={sensor.id} className="space-y-3 rounded-xl border p-4">\n                                  <p className="font-semibold">{sensor.serialNumber}</p>\n                                  <div className="grid gap-2 text-sm md:grid-cols-2">\n                                    <p>{t("adjustment.cards.calculation.pointOne", { standard: String(standardOne ?? "-"), sensor: String(rawOne ?? "-") })}</p>\n                                    <p>{t("adjustment.cards.calculation.pointTwo", { standard: String(standardTwo ?? "-"), sensor: String(rawTwo ?? "-") })}</p>\n                                  </div>\n                                  {coeffA == null || coeffB == null ? (\n                                    <p className="text-sm text-destructive">\n                                      {t("adjustment.cards.calculation.invalid")}\n                                    </p>\n                                  ) : (\n                                    <div className="space-y-2 rounded-lg bg-muted/40 p-3 font-mono text-sm">\n                                      <p>A = ({String(standardTwo)} - {String(standardOne)}) / ({String(rawTwo)} - {String(rawOne)}) = {String(coeffA)}</p>\n                                      <p>B = {String(standardOne)} - {String(coeffA)} × {String(rawOne)} = {String(coeffB)}</p>\n                                      <p>C = 0</p>\n                                    </div>\n                                  )}\n                                </div>\n                              )\n                            })}\n                          </div>\n                        ) : null}\n                      </CardContent>\n                    </Card>\n                  ) : null}\n                </m.div>\n'''
text = text[:insert_index] + calc_card + text[insert_index + len(selected_card_end_marker):]

# Add first-point coefficient lock confirmation before stop confirmation.
stop_dialog_marker = '''        <AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>\n'''
if stop_dialog_marker not in text:
    raise RuntimeError('stop dialog marker not found')
confirm_dialog = '''        <AlertDialog open={showFirstPointConfirm} onOpenChange={setShowFirstPointConfirm}>\n          <AlertDialogContent>\n            <AlertDialogHeader>\n              <AlertDialogTitle>{t("adjustment.cards.points.confirmCoefficientsTitle")}</AlertDialogTitle>\n              <AlertDialogDescription>{t("adjustment.cards.points.confirmCoefficientsDescription")}</AlertDialogDescription>\n            </AlertDialogHeader>\n            <AlertDialogFooter>\n              <AlertDialogCancel>{t("adjustment.cards.points.confirmCoefficientsCancel")}</AlertDialogCancel>\n              <AlertDialogAction\n                disabled={startPointAcquisitionMutation.isPending}\n                onClick={() => {\n                  setShowFirstPointConfirm(false)\n                  startPointAcquisitionMutation.mutate({\n                    pointIndex: 1,\n                    targetValue: isExternalSession ? pointOneManualValue : undefined,\n                  })\n                }}\n              >\n                {t("adjustment.cards.points.confirmCoefficientsStart")}\n              </AlertDialogAction>\n            </AlertDialogFooter>\n          </AlertDialogContent>\n        </AlertDialog>\n\n'''
text = text.replace(stop_dialog_marker, confirm_dialog + stop_dialog_marker, 1)

write(path, text)


# ---------------------------------------------------------------------------
# FR/EN supplement translations
# ---------------------------------------------------------------------------
path = 'website/src/messages/supplements.ts'
text = read(path)
fr_insert = '''  metrologyAdmin: {\n    adjustmentPage: {\n      adjustment: {\n        cards: {\n          points: {\n            startFirstAcquisition: "Lancer l’acquisition du premier point",\n            startSecondAcquisition: "Lancer l’acquisition du deuxième point",\n            confirmCoefficientsTitle: "Vérifier les coefficients avant l’acquisition",\n            confirmCoefficientsDescription: "À partir du lancement de l’acquisition du premier point, les coefficients A/B/C seront verrouillés jusqu’à la fin de l’ajustage. Vérifiez et enregistrez vos coefficients avant de continuer.",\n            confirmCoefficientsCancel: "Revenir aux coefficients",\n            confirmCoefficientsStart: "Lancer l’acquisition",\n          },\n          coefficients: {\n            lockedTitle: "Coefficients verrouillés",\n            lockedDescription: "L’acquisition du premier point a commencé. Les coefficients A/B/C ne peuvent plus être modifiés jusqu’à la fin de l’ajustage.",\n          },\n          calculation: {\n            title: "Calcul de l’ajustage",\n            description: "Détail du calcul linéaire obtenu à partir des moyennes des deux plateaux.",\n            showDetails: "Afficher le détail des calculs",\n            hideDetails: "Masquer le détail des calculs",\n            pointOne: "Point 1 — moyenne étalon : {standard} ; moyenne sonde : {sensor}",\n            pointTwo: "Point 2 — moyenne étalon : {standard} ; moyenne sonde : {sensor}",\n            invalid: "Le calcul est impossible : les deux moyennes sonde sont identiques ou une valeur est absente.",\n          },\n        },\n      },\n    },\n  },\n'''
fr_marker = '}\n\nexport const enSupplements: MessageCatalog = {'
if fr_marker not in text:
    raise RuntimeError('fr supplement boundary not found')
text = text.replace(fr_marker, fr_insert + '}\n\nexport const enSupplements: MessageCatalog = {', 1)

en_insert = '''  metrologyAdmin: {\n    adjustmentPage: {\n      adjustment: {\n        cards: {\n          points: {\n            startFirstAcquisition: "Start first-point acquisition",\n            startSecondAcquisition: "Start second-point acquisition",\n            confirmCoefficientsTitle: "Check coefficients before acquisition",\n            confirmCoefficientsDescription: "Once first-point acquisition starts, A/B/C coefficients are locked until the adjustment operation ends. Check and save the coefficients before continuing.",\n            confirmCoefficientsCancel: "Back to coefficients",\n            confirmCoefficientsStart: "Start acquisition",\n          },\n          coefficients: {\n            lockedTitle: "Coefficients locked",\n            lockedDescription: "First-point acquisition has started. A/B/C coefficients can no longer be changed until the adjustment operation ends.",\n          },\n          calculation: {\n            title: "Adjustment calculation",\n            description: "Details of the linear calculation based on the averages of both stability plateaus.",\n            showDetails: "Show calculation details",\n            hideDetails: "Hide calculation details",\n            pointOne: "Point 1 — standard average: {standard}; sensor average: {sensor}",\n            pointTwo: "Point 2 — standard average: {standard}; sensor average: {sensor}",\n            invalid: "The calculation cannot be performed: both sensor averages are identical or a value is missing.",\n          },\n        },\n      },\n    },\n  },\n'''
en_marker = '}\n\nfunction isRecord(value: unknown): value is MessageCatalog {'
if en_marker not in text:
    raise RuntimeError('en supplement boundary not found')
text = text.replace(en_marker, en_insert + '}\n\nfunction isRecord(value: unknown): value is MessageCatalog {', 1)
write(path, text)


# ---------------------------------------------------------------------------
# Changelog
# ---------------------------------------------------------------------------
path = 'website/CHANGELOG.md'
text = read(path)
marker = '### Métrologie\n\n'
addition = '''### Métrologie\n\n- Ajustage : le lancement de l’opération démarre désormais uniquement la lecture continue des sondes et de l’étalon ; le plateau ne démarre qu’au clic sur l’acquisition d’un point.\n- Les points 1 et 2 sont validés automatiquement à la fin d’un plateau stable avec les moyennes de toutes les mesures collectées pendant la fenêtre.\n- Les coefficients A/B/C restent modifiables avant le premier point puis sont verrouillés côté UI et serveur dès le lancement de sa première acquisition.\n- Le bouton de lecture préalable séparé est supprimé et un détail du calcul linéaire A/B/C est disponible après les deux points, sur le même principe que le détail d’Étalonnage.\n'''
text = replace_once(text, marker, addition, 'website changelog metrology section')
write(path, text)


# ---------------------------------------------------------------------------
# Persistent documentation/backlog
# ---------------------------------------------------------------------------
doc_path = ROOT / 'website/docs/metrology-adjustment-acquisition-flow-28-08-2026.md'
doc_path.write_text('''# Ajustage — acquisitions pilotées par point et moyenne du plateau — 28/08/2026\n\n## Statut\n\n**EN COURS — branche `agent/adjustment-acquisition-stability-flow` — base `dev` `156da60c3847ee751fa3ad7077b35f4bdd505c02`.**\n\n## Retour terrain\n\nLe flux précédent séparait une prélecture des sondes du démarrage de l’ajustage et lançait automatiquement le plateau dès la première mesure étalon de la session. Une fois le plateau déclaré stable, l’utilisateur devait encore cliquer sur `Valider` pour figer le point.\n\nLe nouveau besoin est :\n\n1. un seul bouton pour lancer l’ajustage ;\n2. dès le lancement, lecture continue des sondes et de l’étalon sans démarrer le plateau ;\n3. un bouton explicite `Lancer l’acquisition du premier/deuxième point` ;\n4. le clic démarre seulement alors la fenêtre de stabilité ;\n5. si la stabilité reste conforme pendant la durée configurée, le point est validé automatiquement ;\n6. la valeur du point et chaque valeur sonde sont les moyennes de toutes les mesures du plateau ;\n7. les coefficients A/B/C deviennent immuables dès le lancement de l’acquisition du premier point ;\n8. un dialogue demande de vérifier/enregistrer les coefficients avant ce verrouillage ;\n9. après les deux points, un bouton permet d’afficher le détail de la formule d’ajustage linéaire.\n\n## Conception\n\n- La session démarre avec `currentPoint = null` : la boucle continue d’interroger sondes + étalon mais n’accumule aucune mesure de point.\n- `POST /api/metrologie/ajustage/session/point` lance désormais l’acquisition au lieu de valider manuellement un point.\n- Le `startedAt` du plateau correspond au clic utilisateur.\n- Un dépassement de l’écart maximum étalon conserve le comportement sûr existant : la fenêtre est remise à zéro et recommence à partir de la mesure courante.\n- À l’échéance de la durée, le backend calcule la moyenne étalon et la moyenne de chaque sonde puis crée automatiquement le `ValidatedPoint`.\n- Entre le point 1 et le point 2, la boucle de lecture continue mais aucune mesure n’est incorporée tant que le second bouton n’est pas déclenché.\n- `coefficientsLocked` est exposé dans la session publique et contrôlé dans `updateAdjustmentCoefficients()` : le verrouillage ne dépend donc pas uniquement de l’interface.\n- Pour un étalon externe, le point manuel reste la référence et la capture existante reste immédiate, afin de ne pas inventer un critère de stabilité pour une valeur qui n’est pas interrogée automatiquement.\n\n## Formule affichée\n\nPour chaque sonde, à partir des moyennes du point 1 et du point 2 :\n\n```text\nA = (Etalon2 - Etalon1) / (Sonde2 - Sonde1)\nB = Etalon1 - A × Sonde1\nC = 0\n```\n\nCette présentation correspond au calcul déjà utilisé par `computeLinearAdjustment()` pour persister `Coeff_X` et `Coeff_Constant`.\n\n## Fichiers principaux\n\n- `website/src/lib/metrology-adjustment-session.ts`\n- `website/src/app/api/metrologie/ajustage/session/point/route.ts`\n- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx`\n- `website/src/messages/supplements.ts`\n- `website/CHANGELOG.md`\n- `website/docs/backlog-retours-17-08-2026.md`\n\n## Checklist de validation\n\n- [ ] lancer l’ajustage : aucune progression de plateau avant le premier bouton d’acquisition ;\n- [ ] confirmer que sondes et étalon continuent pourtant d’être lus ;\n- [ ] modifier puis enregistrer A/B/C avant le point 1 ;\n- [ ] cliquer sur le point 1 : vérifier le dialogue de confirmation ;\n- [ ] après confirmation, vérifier que les champs et l’API de coefficients sont verrouillés ;\n- [ ] vérifier que le timer de plateau part au clic ;\n- [ ] laisser un plateau stable arriver à son terme : point 1 validé sans clic supplémentaire ;\n- [ ] comparer la valeur enregistrée du point à la moyenne manuelle des mesures de la fenêtre ;\n- [ ] provoquer un écart supérieur au maximum : le plateau doit repartir de zéro ;\n- [ ] entre les deux points, confirmer la lecture continue sans accumulation de point 2 ;\n- [ ] répéter pour le point 2 et vérifier la fin automatique ;\n- [ ] afficher le détail des calculs et comparer A/B/C au calcul manuel ;\n- [ ] vérifier un étalon externe sans régression ;\n- [ ] vérifier GSP puis GSO ;\n- [ ] vérifier FR/EN et thèmes clair/sombre ;\n- [ ] lancer `pnpm lint`, `pnpm i18n:check` et `pnpm build`.\n''', encoding='utf-8')

backlog_path = 'website/docs/backlog-retours-17-08-2026.md'
backlog = read(backlog_path)
backlog_marker = '## Ajustage — acquisitions pilotées par point et moyenne du plateau — 28/08/2026'
if backlog_marker not in backlog:
    backlog += '''\n\n\n## Ajustage — acquisitions pilotées par point et moyenne du plateau — 28/08/2026\n\nStatut : **`EN_COURS` — branche `agent/adjustment-acquisition-stability-flow` — PR à ouvrir vers `dev`**.\n\n### Retour / comportement attendu\n\n- supprimer le bouton séparé de lecture des sondes ;\n- le lancement de l’ajustage active directement la lecture continue des sondes et de l’étalon sans démarrer de plateau ;\n- `Lancer l’acquisition du premier/deuxième point` démarre le plateau correspondant ;\n- un plateau stable arrivé à sa durée configurée valide automatiquement le point ;\n- le point utilise la moyenne étalon et les moyennes sondes calculées sur toutes les mesures de la fenêtre ;\n- les coefficients restent modifiables avant le point 1 mais sont verrouillés dès son acquisition, avec confirmation utilisateur préalable ;\n- un détail de la formule linéaire d’ajustage est disponible après les deux points.\n\n### Fichiers principaux\n\n- `website/src/lib/metrology-adjustment-session.ts` ;\n- `website/src/app/api/metrologie/ajustage/session/point/route.ts` ;\n- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx` ;\n- `website/src/messages/supplements.ts` ;\n- `website/docs/metrology-adjustment-acquisition-flow-28-08-2026.md`.\n\n### Validation terrain\n\n- [ ] vérifier lecture sonde + étalon dès le lancement, plateau inactif ;\n- [ ] vérifier démarrage du plateau exactement au clic d’acquisition ;\n- [ ] vérifier moyenne et validation automatique du point 1 ;\n- [ ] vérifier verrouillage A/B/C côté interface et API ;\n- [ ] vérifier redémarrage du plateau si l’écart maximum est dépassé ;\n- [ ] vérifier lecture continue entre les points ;\n- [ ] vérifier moyenne et validation automatique du point 2 ;\n- [ ] contrôler la formule A/B/C via le détail des calculs ;\n- [ ] vérifier GSP/GSO, FR/EN et thèmes clair/sombre ;\n- [ ] lancer lint, i18n check et build Web.\n'''
write(backlog_path, backlog)

metrology_doc_path = 'website/docs/metrology-retours-26-08-2026.md'
metrology_doc = read(metrology_doc_path)
if backlog_marker not in metrology_doc:
    metrology_doc += '''\n\n## Ajustage — acquisitions pilotées par point et moyenne du plateau — 28/08/2026\n\nLe flux est repris sur `agent/adjustment-acquisition-stability-flow` depuis `dev` `156da60c3847ee751fa3ad7077b35f4bdd505c02` après merge de la PR #69. Le détail d’implémentation et la checklist de reprise sont centralisés dans `website/docs/metrology-adjustment-acquisition-flow-28-08-2026.md`.\n'''
write(metrology_doc_path, metrology_doc)

print('Adjustment acquisition flow transformations applied successfully.')

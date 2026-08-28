from pathlib import Path

ui_path = Path('website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx')
text = ui_path.read_text(encoding='utf-8')

old = '''                            }\n                                    startMutation.mutate()\n                          }}\n'''
new = '''                            }\n                            startMutation.mutate()\n                          }}\n'''
if text.count(old) != 1:
    raise RuntimeError(f'run button indentation marker count={text.count(old)}')
text = text.replace(old, new, 1)

old = 'disabled={!canStartPointOneAcquisition || startPointAcquisitionMutation.isPending}'
new = 'disabled={!canStartPointOneAcquisition || startPointAcquisitionMutation.isPending || updateCoefficientsMutation.isPending}'
if text.count(old) != 1:
    raise RuntimeError(f'point1 disabled marker count={text.count(old)}')
text = text.replace(old, new, 1)

old = '''  const coefficientsLocked = Boolean(session?.coefficientsLocked)\n  const activeAcquisitionPoint = session?.currentPoint?.pointIndex ?? null\n'''
new = '''  const coefficientsLocked = Boolean(session?.coefficientsLocked)\n  const hasUnsavedCoefficientChanges = Object.values(coefficientTouched).some((fields) =>\n    Object.values(fields).some(Boolean),\n  )\n  const activeAcquisitionPoint = session?.currentPoint?.pointIndex ?? null\n'''
if text.count(old) != 1:
    raise RuntimeError(f'unsaved coefficient state marker count={text.count(old)}')
text = text.replace(old, new, 1)

old = 'disabled={startPointAcquisitionMutation.isPending}\n                onClick={() => {'
new = 'disabled={startPointAcquisitionMutation.isPending || updateCoefficientsMutation.isPending || hasUnsavedCoefficientChanges}\n                onClick={() => {'
if text.count(old) != 1:
    raise RuntimeError(f'confirm disabled marker count={text.count(old)}')
text = text.replace(old, new, 1)

old = '''              <AlertDialogDescription>{t("adjustment.cards.points.confirmCoefficientsDescription")}</AlertDialogDescription>\n'''
new = '''              <AlertDialogDescription>\n                {hasUnsavedCoefficientChanges\n                  ? t("adjustment.cards.points.confirmCoefficientsUnsavedDescription")\n                  : t("adjustment.cards.points.confirmCoefficientsDescription")}\n              </AlertDialogDescription>\n'''
if text.count(old) != 1:
    raise RuntimeError(f'confirm description marker count={text.count(old)}')
text = text.replace(old, new, 1)

old = '''                                      <p>A = ({String(standardTwo)} - {String(standardOne)}) / ({String(rawTwo)} - {String(rawOne)}) = {String(coeffA)}</p>\n                                      <p>B = {String(standardOne)} - {String(coeffA)} × {String(rawOne)} = {String(coeffB)}</p>\n                                      <p>C = 0</p>\n'''
new = '''                                      <p>\n                                        {t("adjustment.cards.calculation.formulaA", {\n                                          standardTwo: formatDecimalDisplay(standardTwo),\n                                          standardOne: formatDecimalDisplay(standardOne),\n                                          sensorTwo: formatDecimalDisplay(rawTwo),\n                                          sensorOne: formatDecimalDisplay(rawOne),\n                                          result: formatCoefficientDisplay(coeffA),\n                                        })}\n                                      </p>\n                                      <p>\n                                        {t("adjustment.cards.calculation.formulaB", {\n                                          standardOne: formatDecimalDisplay(standardOne),\n                                          coefficientA: formatCoefficientDisplay(coeffA),\n                                          sensorOne: formatDecimalDisplay(rawOne),\n                                          result: formatCoefficientDisplay(coeffB),\n                                        })}\n                                      </p>\n                                      <p>{t("adjustment.cards.calculation.formulaC")}</p>\n'''
if text.count(old) != 1:
    raise RuntimeError(f'calculation formula marker count={text.count(old)}')
text = text.replace(old, new, 1)
ui_path.write_text(text, encoding='utf-8')

messages_path = Path('website/src/messages/supplements.ts')
messages = messages_path.read_text(encoding='utf-8')

fr_point_old = '''            confirmCoefficientsDescription: "À partir du lancement de l’acquisition du premier point, les coefficients A/B/C seront verrouillés jusqu’à la fin de l’ajustage. Vérifiez et enregistrez vos coefficients avant de continuer.",\n            confirmCoefficientsCancel: "Revenir aux coefficients",\n'''
fr_point_new = '''            confirmCoefficientsDescription: "À partir du lancement de l’acquisition du premier point, les coefficients A/B/C seront verrouillés jusqu’à la fin de l’ajustage. Vérifiez et enregistrez vos coefficients avant de continuer.",\n            confirmCoefficientsUnsavedDescription: "Des coefficients A/B/C ont été modifiés mais ne sont pas encore enregistrés. Revenez aux coefficients et enregistrez-les avant de lancer l’acquisition du premier point.",\n            confirmCoefficientsCancel: "Revenir aux coefficients",\n'''
if messages.count(fr_point_old) != 1:
    raise RuntimeError(f'FR unsaved translation marker count={messages.count(fr_point_old)}')
messages = messages.replace(fr_point_old, fr_point_new, 1)

en_point_old = '''            confirmCoefficientsDescription: "Once first-point acquisition starts, A/B/C coefficients are locked until the adjustment operation ends. Check and save the coefficients before continuing.",\n            confirmCoefficientsCancel: "Back to coefficients",\n'''
en_point_new = '''            confirmCoefficientsDescription: "Once first-point acquisition starts, A/B/C coefficients are locked until the adjustment operation ends. Check and save the coefficients before continuing.",\n            confirmCoefficientsUnsavedDescription: "A/B/C coefficients have been changed but are not saved yet. Go back to the coefficients and save them before starting first-point acquisition.",\n            confirmCoefficientsCancel: "Back to coefficients",\n'''
if messages.count(en_point_old) != 1:
    raise RuntimeError(f'EN unsaved translation marker count={messages.count(en_point_old)}')
messages = messages.replace(en_point_old, en_point_new, 1)

fr_old = '''            invalid: "Le calcul est impossible : les deux moyennes sonde sont identiques ou une valeur est absente.",\n'''
fr_new = '''            invalid: "Le calcul est impossible : les deux moyennes sonde sont identiques ou une valeur est absente.",\n            formulaA: "A = ({standardTwo} - {standardOne}) / ({sensorTwo} - {sensorOne}) = {result}",\n            formulaB: "B = {standardOne} - {coefficientA} × {sensorOne} = {result}",\n            formulaC: "C = 0",\n'''
if messages.count(fr_old) != 1:
    raise RuntimeError(f'FR calculation translation marker count={messages.count(fr_old)}')
messages = messages.replace(fr_old, fr_new, 1)

en_old = '''            invalid: "The calculation cannot be performed: both sensor averages are identical or a value is missing.",\n'''
en_new = '''            invalid: "The calculation cannot be performed: both sensor averages are identical or a value is missing.",\n            formulaA: "A = ({standardTwo} - {standardOne}) / ({sensorTwo} - {sensorOne}) = {result}",\n            formulaB: "B = {standardOne} - {coefficientA} × {sensorOne} = {result}",\n            formulaC: "C = 0",\n'''
if messages.count(en_old) != 1:
    raise RuntimeError(f'EN calculation translation marker count={messages.count(en_old)}')
messages = messages.replace(en_old, en_new, 1)
messages_path.write_text(messages, encoding='utf-8')

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

old = 'disabled={startPointAcquisitionMutation.isPending}\n                onClick={() => {'
new = 'disabled={startPointAcquisitionMutation.isPending || updateCoefficientsMutation.isPending}\n                onClick={() => {'
if text.count(old) != 1:
    raise RuntimeError(f'confirm disabled marker count={text.count(old)}')
text = text.replace(old, new, 1)

old = '''                                      <p>A = ({String(standardTwo)} - {String(standardOne)}) / ({String(rawTwo)} - {String(rawOne)}) = {String(coeffA)}</p>\n                                      <p>B = {String(standardOne)} - {String(coeffA)} × {String(rawOne)} = {String(coeffB)}</p>\n                                      <p>C = 0</p>\n'''
new = '''                                      <p>\n                                        {t("adjustment.cards.calculation.formulaA", {\n                                          standardTwo: String(standardTwo),\n                                          standardOne: String(standardOne),\n                                          sensorTwo: String(rawTwo),\n                                          sensorOne: String(rawOne),\n                                          result: String(coeffA),\n                                        })}\n                                      </p>\n                                      <p>\n                                        {t("adjustment.cards.calculation.formulaB", {\n                                          standardOne: String(standardOne),\n                                          coefficientA: String(coeffA),\n                                          sensorOne: String(rawOne),\n                                          result: String(coeffB),\n                                        })}\n                                      </p>\n                                      <p>{t("adjustment.cards.calculation.formulaC")}</p>\n'''
if text.count(old) != 1:
    raise RuntimeError(f'calculation formula marker count={text.count(old)}')
text = text.replace(old, new, 1)
ui_path.write_text(text, encoding='utf-8')

messages_path = Path('website/src/messages/supplements.ts')
messages = messages_path.read_text(encoding='utf-8')

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

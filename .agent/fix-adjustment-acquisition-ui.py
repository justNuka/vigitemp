from pathlib import Path

path = Path('website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx')
text = path.read_text(encoding='utf-8')

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

path.write_text(text, encoding='utf-8')

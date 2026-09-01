import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Terminal } from '@/components/magicui/terminal'
import { cn } from '@/lib/utils'

export function HotlineLogsPanel({
  title,
  filePath,
  error,
  lines,
  loading,
  emptyLabel,
  lineClassName,
}: {
  title: string
  filePath?: string | null
  error?: string | null
  lines: string[]
  loading: boolean
  emptyLabel: string
  lineClassName: (line: string) => string
}) {
  return (
    <Card className="bg-white dark:bg-popover/95">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {filePath ? <p className="text-xs text-muted-foreground">{filePath}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Terminal className="max-h-120 max-w-full overflow-x-hidden" sequence={false}>
          {lines.map((line, index) => (
            <span key={`${line}-${index}`} className={cn('block wrap-break-word whitespace-pre-wrap', lineClassName(line))}>{line}</span>
          ))}
          {!loading && lines.length === 0 ? <span className="text-muted-foreground">{emptyLabel}</span> : null}
        </Terminal>
      </CardContent>
    </Card>
  )
}

export function HotlineLogsFilters({
  logSource,
  setLogSource,
  logDate,
  setLogDate,
  logLimit,
  setLogLimit,
  onRefresh,
  loading,
  labels,
}: {
  logSource: 'web' | 'server' | 'web-service-error' | 'web-service-wrapper' | 'web-service-output'
  setLogSource: (value: 'web' | 'server' | 'web-service-error' | 'web-service-wrapper' | 'web-service-output') => void
  logDate: string
  setLogDate: (value: string) => void
  logLimit: string
  setLogLimit: (value: string) => void
  onRefresh: () => void
  loading: boolean
  labels: Record<string, string>
}) {
  return (
    <Card className="bg-white dark:bg-popover/95">
      <CardHeader>
        <CardTitle className="text-base">{labels.filterTitle}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="log-source">{labels.source}</Label>
          <select id="log-source" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm dark:bg-card" value={logSource} onChange={(event) => setLogSource(event.target.value as typeof logSource)}>
            <option value="web">{labels.web}</option>
            <option value="server">{labels.server}</option>
            <option value="web-service-error">{labels.webServiceError}</option>
            <option value="web-service-wrapper">{labels.webServiceWrapper}</option>
            <option value="web-service-output">{labels.webServiceOutput}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="log-date">{labels.date}</Label>
          <Input id="log-date" type="date" value={logDate} onChange={(event) => setLogDate(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="log-limit">{labels.lines}</Label>
          <Input id="log-limit" value={logLimit} onChange={(event) => setLogLimit(event.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={onRefresh} disabled={loading}>{loading ? labels.loading : labels.refresh}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

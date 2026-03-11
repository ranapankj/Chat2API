import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Copy, Check, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface RequestLogEntry {
  id: string
  status: 'success' | 'error'
  statusCode: number
  timestamp: string
  time: string
  method?: string
  url?: string
  provider?: string
  providerId?: string
  model?: string
  actualModel?: string
  account?: string
  accountId?: string
  userInput?: string
  requestBody?: string
  duration?: number
  isStream?: boolean
  error?: string
}

interface LogDetailModalProps {
  log: RequestLogEntry | null
  open: boolean
  onClose: () => void
}

function JsonViewer({ data, maxHeight = 300 }: { data: string; maxHeight?: number }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [data])

  const lines = data.split('\n')
  const lineCount = lines.length
  const isLong = lineCount > 20 || data.length > 2000

  const renderLine = (line: string, index: number) => {
    let className = 'text-muted-foreground'

    if (line.includes(':')) {
      const valueParts = line.split(':')
      const value = valueParts.slice(1).join(':').trim()

      if (value.startsWith('"') || value.startsWith("'")) {
        className = 'text-green-500'
      } else if (value === 'true' || value === 'false') {
        className = 'text-yellow-500'
      } else if (!isNaN(Number(value))) {
        className = 'text-blue-500'
      } else if (value === 'null') {
        className = 'text-red-400'
      }
    }

    return (
      <div key={index} className="flex">
        <span className="w-8 text-right pr-2 text-muted-foreground/50 select-none text-xs">
          {index + 1}
        </span>
        <span className={cn('text-xs font-mono', className)}>{line}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className={cn('bg-muted/50 rounded-lg p-3 overflow-auto', !expanded && isLong)}
        style={{ maxHeight: expanded ? undefined : maxHeight }}
      >
        <pre className="text-xs font-mono">
          {lines.slice(0, expanded ? undefined : 20).map(renderLine)}
          {!expanded && isLong && (
            <div className="text-muted-foreground text-center py-2">
              ... {lineCount - 20} more lines
            </div>
          )}
        </pre>
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        {isLong && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  )
}

export function LogDetailModal({ log, open, onClose }: LogDetailModalProps) {
  const { t } = useTranslation()

  if (!log) return null

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `log-${log.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [log])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('logs.detail')}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                {t('logs.export')}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">{t('logs.time')}</label>
                <p className="font-medium">{log.timestamp}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t('logs.status')}</label>
                <p className="font-medium flex items-center gap-2">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    )}
                  />
                  {log.statusCode}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t('logs.provider')}</label>
                <p className="font-medium">{log.provider || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t('logs.model')}</label>
                <p className="font-medium">{log.model || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t('logs.account')}</label>
                <p className="font-medium">{log.account || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Duration</label>
                <p className="font-medium">{log.duration ? `${(log.duration * 1000).toFixed(0)}ms` : '-'}</p>
              </div>
            </div>

            {log.userInput && (
              <div>
                <label className="text-sm text-muted-foreground">{t('logs.userInput')}</label>
                <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{log.userInput}</p>
                </div>
              </div>
            )}

            {log.error && (
              <div>
                <label className="text-sm text-red-500">Error</label>
                <div className="mt-1 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-sm text-red-600">{log.error}</p>
                </div>
              </div>
            )}

            {log.requestBody && (
              <div>
                <label className="text-sm text-muted-foreground">{t('logs.requestBody')}</label>
                <div className="mt-1">
                  <JsonViewer data={log.requestBody} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

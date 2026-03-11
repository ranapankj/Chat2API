import { useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Copy, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLogsStore } from '@/stores/logsStore'

const levelColors: Record<string, string> = {
  debug: 'bg-gray-500',
  info: 'bg-blue-500',
  warn: 'bg-yellow-500',
  error: 'bg-red-500',
}

function formatTime(timestamp: string | number | Date): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export function LogDetail() {
  const { selectedLog, setSelectedLog } = useLogsStore()
  const { toast } = useToast()

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        toast({
          title: 'Copied',
          description: 'Copied to clipboard',
        })
      } catch {
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy to clipboard',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  const handleCopyAll = useCallback(() => {
    if (!selectedLog) return

    const logText = [
      `Time: ${formatTime(selectedLog.timestamp)}`,
      `Level: ${selectedLog.level.toUpperCase()}`,
      `Message: ${selectedLog.message}`,
      selectedLog.providerId && `Provider: ${selectedLog.providerId}`,
      selectedLog.accountId && `Account: ${selectedLog.accountId}`,
      selectedLog.requestId && `Request ID: ${selectedLog.requestId}`,
      selectedLog.data && `Data: ${JSON.stringify(selectedLog.data, null, 2)}`,
    ]
      .filter(Boolean)
      .join('\n')

    handleCopy(logText)
  }, [selectedLog, handleCopy])

  const handleClose = useCallback(() => {
    setSelectedLog(null)
  }, [setSelectedLog])

  return (
    <Sheet open={!!selectedLog} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Log Details</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription>View complete log information</SheetDescription>
        </SheetHeader>

        {selectedLog && (
          <ScrollArea className="h-[calc(100vh-120px)] mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn('text-white', levelColors[selectedLog.level])}
                  >
                    {selectedLog.level.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(selectedLog.timestamp)}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyAll}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy All
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Message
                  </label>
                  <div className="mt-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
                    {selectedLog.message}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                      onClick={() => handleCopy(selectedLog.message)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {selectedLog.providerId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Provider ID
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {selectedLog.providerId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopy(selectedLog.providerId!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedLog.accountId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Account ID
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {selectedLog.accountId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopy(selectedLog.accountId!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedLog.requestId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Request ID
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {selectedLog.requestId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopy(selectedLog.requestId!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedLog.data && Object.keys(selectedLog.data).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Additional Data
                    </label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <pre className="text-sm font-mono overflow-x-auto">
                        {JSON.stringify(selectedLog.data, null, 2)}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          handleCopy(JSON.stringify(selectedLog.data, null, 2))
                        }
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Data
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Log ID
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm text-muted-foreground">
                      {selectedLog.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopy(selectedLog.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}

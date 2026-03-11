import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface RequestLogEntry {
  id: string
  timestamp: number
  status: 'success' | 'error'
  statusCode: number
  method: string
  url: string
  model: string
  actualModel?: string
  providerId?: string
  providerName?: string
  accountId?: string
  accountName?: string
  requestBody?: string
  userInput?: string
  responseStatus: number
  responsePreview?: string
  latency: number
  isStream: boolean
  errorMessage?: string
  errorStack?: string
}

interface RequestLogDetailProps {
  log: RequestLogEntry
  onClose: () => void
}

export function RequestLogDetail({ log, onClose }: RequestLogDetailProps) {
  const [activeTab, setActiveTab] = useState('info')

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getStatusColor = (status: 'success' | 'error') => {
    return status === 'success' 
      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
      : 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const renderJsonViewer = (jsonString: string | undefined) => {
    if (!jsonString) return <div className="text-muted-foreground">No data</div>
    
    try {
      const parsed = JSON.parse(jsonString)
      return (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(jsonString)}
          >
            Copy
          </Button>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )
    } catch {
      return (
        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
          {jsonString}
        </pre>
      )
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(log.status)}>
              {log.statusCode}
            </Badge>
            <span>{log.model}</span>
            {log.actualModel && log.actualModel !== log.model && (
              <span className="text-sm text-muted-foreground font-normal">
                → {log.actualModel}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="user">User Input</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                    <p className="text-sm">{formatTime(log.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Latency</label>
                    <p className="text-sm">{formatLatency(log.latency)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Method</label>
                    <p className="text-sm">{log.method}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">URL</label>
                    <p className="text-sm font-mono">{log.url}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Provider</label>
                    <p className="text-sm">{log.providerName || log.providerId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account</label>
                    <p className="text-sm">{log.accountName || log.accountId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Stream</label>
                    <p className="text-sm">{log.isStream ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Response Status</label>
                    <p className="text-sm">{log.responseStatus}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="request" className="mt-4">
            <ScrollArea className="h-96">
              {renderJsonViewer(log.requestBody)}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="user" className="mt-4">
            <ScrollArea className="h-96">
              {log.userInput ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{log.userInput}</p>
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  No user input available
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="error" className="mt-4">
            <ScrollArea className="h-96">
              {log.errorMessage ? (
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-500 font-medium">{log.errorMessage}</p>
                  </div>
                  {log.errorStack && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Stack Trace</label>
                      <pre className="mt-2 text-xs bg-muted p-4 rounded-lg overflow-auto">
                        {log.errorStack}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  No error information
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

import * as React from 'react'
import { ArrowUpRight, FolderOpen, Settings } from 'lucide-react'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getSettingsSync,
  setDownloadPath,
  setDownloadPrompt,
  setFetchBucketStats,
  type ThemeMode
} from '@/lib/settings'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
]

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({
  open,
  onOpenChange
}: SettingsDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <SettingsDialogBody />}
    </Dialog>
  )
}

function SettingsDialogBody(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  const initial = React.useMemo(() => getSettingsSync(), [])
  const [downloadPath, setDownloadPathState] = React.useState(initial.downloadPath)
  const [promptBeforeDownload, setPromptBeforeDownload] = React.useState(
    initial.promptBeforeDownload
  )
  const [fetchBucketStats, setFetchBucketStatsState] = React.useState(initial.fetchBucketStats)

  const saveDownloadPath = (path: string): void => {
    setDownloadPathState(path)
    void setDownloadPath(path)
  }

  const togglePrompt = (): void => {
    const next = !promptBeforeDownload
    setPromptBeforeDownload(next)
    void setDownloadPrompt(next)
  }

  const toggleFetchBucketStats = (): void => {
    const next = !fetchBucketStats
    setFetchBucketStatsState(next)
    void setFetchBucketStats(next)
  }

  const handleBrowse = async (): Promise<void> => {
    const startPath = promptBeforeDownload ? undefined : downloadPath
    const selected = await window.api.settings.selectDownloadDirectory(startPath)
    if (selected) {
      saveDownloadPath(selected)
      if (promptBeforeDownload) {
        setPromptBeforeDownload(false)
        void setDownloadPrompt(false)
      }
    }
  }

  return (
    <DialogContent className="gap-5 sm:max-w-[420px]">
      <DialogHeader className="flex-row items-center gap-2 space-y-0">
        <Settings className="size-4 shrink-0" />
        <DialogTitle className="text-base font-semibold">Settings</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-2">
          <Label className="text-xs font-medium text-foreground/80">Color Theme</Label>
          <div className="flex gap-1.5">
            {THEME_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'h-8 flex-1 text-xs font-medium shadow-xs',
                  theme === opt.value &&
                    'border-info bg-info-dim text-foreground hover:bg-info-dim'
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <Label className="text-xs font-medium text-foreground/80">Default Download Path</Label>
          <Input
            value={downloadPath}
            onChange={(e) => saveDownloadPath(e.target.value)}
            disabled={promptBeforeDownload}
            className="h-9 font-mono text-[12px]"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleBrowse()}
              disabled={promptBeforeDownload}
              className="flex-1"
            >
              <FolderOpen className="text-amber-500" />
              <span>Browse…</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={togglePrompt}
              className={cn(
                'flex-1',
                promptBeforeDownload && 'border-info bg-info-dim hover:bg-info-dim'
              )}
            >
              <ArrowUpRight className="size-3.5" />
              <span>Prompt</span>
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            <ArrowUpRight className="mr-0.5 inline size-3 align-[-2px]" />
            Prompt = ask location before each download
          </p>
        </section>

        <section className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label className="text-xs font-medium text-foreground/80">Fetch Bucket Statistics</Label>
            <p className="text-[11px] text-muted-foreground">
              Show object count and size for each bucket. Disable to speed up loading.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={fetchBucketStats}
            onClick={toggleFetchBucketStats}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none',
              fetchBucketStats ? 'bg-[color:var(--info)]' : 'bg-input'
            )}
          >
            <span
              className={cn(
                'pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform',
                fetchBucketStats ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </button>
        </section>
      </div>
    </DialogContent>
  )
}

import { Download, History, Link, Lock, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FileIcon } from '@/components/file-icon'
import type { S3File } from '@/lib/types'

type PreviewPanelProps = {
  file: S3File
  bucket: string
  onClose: () => void
}

export function PreviewPanel({ file, bucket, onClose }: PreviewPanelProps): React.JSX.Element {
  const metaRows: [string, string][] = [
    ['Size', file.size],
    ['Type', file.mime || '—'],
    ['Modified', file.modified],
    ['Key', `${bucket}/${file.name}`]
  ]

  return (
    <div className="flex w-[268px] shrink-0 animate-in slide-in-from-right flex-col overflow-hidden border-l bg-background">
      <div className="flex shrink-0 items-center justify-between border-b px-3 py-2.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <FileIcon
            type={file.type}
            className={file.type === 'folder' ? 'size-[13px]' : 'size-[13px] text-muted-foreground'}
          />
          <span className="truncate text-[12.5px] font-medium">{file.name}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close preview"
        >
          <X className="size-3" />
        </button>
      </div>
      <div className="mx-3 mt-2.5 mb-1.5 flex h-[120px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/60">
        <FileIcon type={file.type} className="size-9 text-muted-foreground" />
        {file.type === 'image' && (
          <span className="text-[11px] text-muted-foreground">image preview</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        {metaRows.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-px border-b py-1.5 last:border-none">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {k}
            </span>
            <span className="font-mono text-[11.5px] break-all text-foreground/80">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex shrink-0 flex-col gap-1 border-t px-3 pt-2 pb-2.5">
        <Button variant="outline" size="xs" className="w-full justify-center">
          <Download />
          <span>Download</span>
        </Button>
        <Button variant="outline" size="xs" className="w-full justify-center">
          <Link />
          <span>Copy S3 URL</span>
        </Button>
        <Button variant="outline" size="xs" className="w-full justify-center">
          <Lock />
          <span>Presigned URL</span>
        </Button>
        <Button variant="outline" size="xs" className="w-full justify-center">
          <History />
          <span>Version History</span>
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="w-full justify-center text-[color:var(--danger)] hover:text-[color:var(--danger)]"
        >
          <Trash2 />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  )
}

import * as React from 'react'
import { Download, Link, Play, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FileIcon } from '@/components/file-icon'
import type { S3File } from '@/lib/types'

type FileViewerProps = {
  file: S3File
  onClose: () => void
}

export function FileViewer({ file, onClose }: FileViewerProps): React.JSX.Element {
  const [pos, setPos] = React.useState({ x: 220, y: 90 })
  const dragRef = React.useRef<{ sx: number; sy: number } | null>(null)

  const onMouseDown = (e: React.MouseEvent): void => {
    dragRef.current = { sx: e.clientX - pos.x, sy: e.clientY - pos.y }
    const onMove = (ev: MouseEvent): void => {
      if (!dragRef.current) return
      setPos({ x: ev.clientX - dragRef.current.sx, y: ev.clientY - dragRef.current.sy })
    }
    const onUp = (): void => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const isImg = file.type === 'image'
  const isAudio = file.type === 'audio'

  return (
    <div
      className="fixed z-[100] w-[480px] overflow-hidden rounded-lg border bg-background shadow-2xl animate-in zoom-in-95 fade-in"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        onMouseDown={onMouseDown}
        className="flex h-10 cursor-grab items-center gap-2 border-b bg-muted/60 px-3 select-none active:cursor-grabbing"
      >
        <div className="flex gap-1.5">
          <span className="size-[11px] rounded-full border border-black/10 bg-[#fe5f57]" />
          <span className="size-[11px] rounded-full border border-black/10 bg-[#febc2e]" />
          <span className="size-[11px] rounded-full border border-black/10 bg-[#28c840]" />
        </div>
        <span className="flex-1 text-center text-[12.5px] font-medium text-muted-foreground">
          {file.name}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close viewer"
        >
          <X className="size-3" />
        </button>
      </div>

      {isImg && (
        <div className="m-3 flex h-[180px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/60">
          <FileIcon type="image" className="size-9 text-muted-foreground" />
          <span className="text-[11.5px] text-muted-foreground">1920 × 480 px · PNG</span>
        </div>
      )}

      {isAudio && (
        <div className="px-3 pt-3.5">
          <div className="mb-2.5 flex flex-col items-center gap-2">
            <FileIcon type="audio" className="size-9 text-muted-foreground" />
            <span className="text-[12.5px] font-medium">{file.name}</span>
            <span className="text-[11.5px] text-muted-foreground">
              audio/mpeg · 2.1 MB · 2m 18s
            </span>
          </div>
          <div className="mx-0 mb-3 flex items-center gap-2.5 rounded-md border bg-muted/60 px-3.5 py-2.5">
            <button
              type="button"
              className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-foreground text-background"
              aria-label="Play"
            >
              <Play className="size-3 fill-current" />
            </button>
            <div className="h-[3px] flex-1 overflow-hidden rounded-sm bg-border">
              <div className="h-full rounded-sm bg-[color:var(--info)]" style={{ width: '28%' }} />
            </div>
            <span className="text-[11px] whitespace-nowrap text-muted-foreground">0:39 / 2:18</span>
          </div>
        </div>
      )}

      {!isImg && !isAudio && (
        <div className="m-3 flex h-[180px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/60">
          <FileIcon type={file.type} className="size-9 text-muted-foreground" />
          <span className="text-[11.5px] text-muted-foreground">{file.mime}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-3.5 pb-3.5">
        {isImg ? (
          <>
            <div className="flex gap-1">
              <Button variant="outline" size="xs">
                ← Prev
              </Button>
              <span className="flex items-center px-1 text-[11.5px] text-muted-foreground">
                3/8
              </span>
              <Button variant="outline" size="xs">
                Next →
              </Button>
            </div>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="xs">
                50%
              </Button>
              <Button variant="outline" size="xs">
                Fit
              </Button>
              <Button variant="ghost" size="xs">
                Fill
              </Button>
            </div>
          </>
        ) : (
          <div />
        )}
        <div className="ml-auto flex gap-1">
          <Button variant="outline" size="xs">
            <Download />
            <span>Save</span>
          </Button>
          <Button variant="outline" size="xs">
            <Link />
            <span>URL</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

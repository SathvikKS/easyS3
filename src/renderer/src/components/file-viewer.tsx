import * as React from 'react'
import { ChevronLeft, ChevronRight, Download, Loader2, Lock, Play, X } from 'lucide-react'
import JsonView from '@uiw/react-json-view'

import { Button } from '@/components/ui/button'
import { FileIcon } from '@/components/file-icon'
import { toastError, toastSuccess } from '@/lib/toast'
import type { S3File } from '@/lib/types'

// Maps the app's CSS custom properties into the JSON viewer's theme tokens so
// the viewer automatically follows dark/light mode without any JS detection.
const JSON_VIEW_THEME = {
  '--w-rjv-font-family': 'ui-monospace, monospace',
  '--w-rjv-font-size': '11px',
  '--w-rjv-background-color': 'transparent',
  '--w-rjv-color': 'var(--foreground)',
  '--w-rjv-key-string': 'var(--info)',
  '--w-rjv-key-number': 'var(--info)',
  '--w-rjv-line-color': 'var(--border)',
  '--w-rjv-arrow-color': 'var(--muted-foreground)',
  '--w-rjv-info-color': 'var(--muted-foreground)',
  '--w-rjv-curlybraces-color': 'var(--foreground)',
  '--w-rjv-colon-color': 'var(--muted-foreground)',
  '--w-rjv-brackets-color': 'var(--foreground)',
  '--w-rjv-ellipsis-color': 'var(--muted-foreground)',
  '--w-rjv-quotes-color': 'var(--info)',
  '--w-rjv-quotes-string-color': 'var(--success)',
  '--w-rjv-type-string-color': 'var(--success)',
  '--w-rjv-type-int-color': 'var(--info)',
  '--w-rjv-type-float-color': 'var(--info)',
  '--w-rjv-type-bigint-color': 'var(--info)',
  '--w-rjv-type-boolean-color': 'var(--danger)',
  '--w-rjv-type-date-color': 'var(--muted-foreground)',
  '--w-rjv-type-url-color': 'var(--info)',
  '--w-rjv-type-null-color': 'var(--muted-foreground)',
  '--w-rjv-type-nan-color': 'var(--muted-foreground)',
  '--w-rjv-type-undefined-color': 'var(--muted-foreground)',
  '--w-rjv-copied-color': 'var(--foreground)',
  '--w-rjv-copied-success-color': 'var(--success)',
} as React.CSSProperties

type PreviewResult =
  | { type: 'url'; url: string }
  | { type: 'text'; content: string }
  | { type: 'none' }

type FileViewerProps = {
  file: S3File
  connId: string
  bucket: string
  keyPrefix: string
  siblings: S3File[]
  onClose: () => void
}

export function FileViewer({
  file: initialFile,
  connId,
  bucket,
  keyPrefix,
  siblings,
  onClose
}: FileViewerProps): React.JSX.Element {
  const [pos, setPos] = React.useState({ x: 220, y: 90 })
  const dragRef = React.useRef<{ sx: number; sy: number } | null>(null)
  const [zoom, setZoom] = React.useState<'fit' | 'fill' | '50'>('fit')

  const imageSiblings = React.useMemo(
    () => siblings.filter((s) => s.type === 'image'),
    [siblings]
  )
  const initialImgIdx = imageSiblings.findIndex((s) => s.name === initialFile.name)
  const [imgIdx, setImgIdx] = React.useState(initialImgIdx >= 0 ? initialImgIdx : 0)

  const currentFile =
    initialFile.type === 'image' && imageSiblings.length > 0
      ? (imageSiblings[imgIdx] ?? initialFile)
      : initialFile

  const fullKey = `${keyPrefix}${currentFile.name}`

  const [preview, setPreview] = React.useState<{
    status: 'idle' | 'loading' | 'loaded'
    data: PreviewResult | null
  }>({ status: 'idle', data: null })
  const [downloadLoading, setDownloadLoading] = React.useState(false)
  const [urlLoading, setUrlLoading] = React.useState(false)

  const jsonResult = React.useMemo<{ ok: true; value: unknown } | { ok: false }>(() => {
    if (preview.status !== 'loaded' || preview.data?.type !== 'text') return { ok: false }
    try {
      // Strip UTF-8 BOM that S3 range responses sometimes prepend
      const content = preview.data.content.replace(/^﻿/, '').trim()
      return { ok: true, value: JSON.parse(content) }
    } catch {
      return { ok: false }
    }
  }, [preview])

  const previewable =
    currentFile.type === 'image' ||
    currentFile.type === 'audio' ||
    currentFile.type === 'video' ||
    currentFile.type === 'text' ||
    currentFile.type === 'data'

  React.useEffect(() => {
    if (!previewable) {
      setPreview({ status: 'idle', data: null })
      return
    }
    let cancelled = false
    setPreview({ status: 'loading', data: null })
    window.api.files
      .getPreview({ connId, bucket, key: fullKey, fileType: currentFile.type })
      .then((result) => {
        if (!cancelled) setPreview({ status: 'loaded', data: result })
      })
      .catch(() => {
        if (!cancelled) setPreview({ status: 'loaded', data: { type: 'none' } })
      })
    return () => {
      cancelled = true
    }
  }, [fullKey, currentFile.type, connId, bucket, previewable])

  const handleDownload = async (): Promise<void> => {
    setDownloadLoading(true)
    try {
      const s = window.api.settings.getAllSync()
      const destPath = `${s.downloadPath}/${currentFile.name}`
      const result = await window.api.files.download({ connId, bucket, key: fullKey, destPath })
      if (result.success) toastSuccess('Downloaded', currentFile.name)
      else toastError('Download failed', result.error)
    } catch (err) {
      toastError('Download failed', err instanceof Error ? err.message : undefined)
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleCopyPresigned = async (): Promise<void> => {
    setUrlLoading(true)
    try {
      const { url } = await window.api.files.getPresignedUrl({
        connId,
        bucket,
        key: fullKey,
        expiresIn: 3600
      })
      await navigator.clipboard.writeText(url)
      toastSuccess('Copied', 'Presigned URL (1 hour) copied')
    } catch (err) {
      toastError('Copy failed', err instanceof Error ? err.message : undefined)
    } finally {
      setUrlLoading(false)
    }
  }

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

  const isImg = currentFile.type === 'image'
  const isAudio = currentFile.type === 'audio'
  const isVideo = currentFile.type === 'video'

  const renderContent = (): React.ReactNode => {
    if (isImg) {
      const imgClass =
        zoom === 'fit'
          ? 'max-h-full max-w-full object-contain'
          : zoom === 'fill'
            ? 'h-full w-full object-cover'
            : 'w-1/2 object-contain'
      if (preview.status === 'loading') {
        return (
          <div className="m-3 flex h-[260px] items-center justify-center rounded-md border border-dashed bg-muted/60">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )
      }
      if (preview.status === 'loaded' && preview.data?.type === 'url') {
        return (
          <div className="m-3 flex h-[260px] items-center justify-center overflow-hidden rounded-md border border-dashed bg-muted/60">
            <img src={preview.data.url} alt={currentFile.name} className={imgClass} />
          </div>
        )
      }
      return (
        <div className="m-3 flex h-[260px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/60">
          <FileIcon type="image" className="size-9 text-muted-foreground" />
          <span className="text-[11.5px] text-muted-foreground">{currentFile.mime}</span>
        </div>
      )
    }

    if (isAudio) {
      return (
        <div className="px-3 pt-3.5">
          <div className="mb-2.5 flex flex-col items-center gap-2">
            <FileIcon type="audio" className="size-9 text-muted-foreground" />
            <span className="text-[12.5px] font-medium">{currentFile.name}</span>
            <span className="text-[11.5px] text-muted-foreground">
              {currentFile.mime} · {currentFile.size}
            </span>
          </div>
          {preview.status === 'loading' ? (
            <div className="mx-0 mb-3 flex h-[46px] items-center justify-center rounded-md border bg-muted/60">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : preview.status === 'loaded' && preview.data?.type === 'url' ? (
            <audio controls src={preview.data.url} className="mb-3 w-full rounded-md" />
          ) : (
            <div className="mx-0 mb-3 flex items-center gap-2.5 rounded-md border bg-muted/60 px-3.5 py-2.5">
              <button
                type="button"
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-foreground text-background"
                aria-label="Play"
                disabled
              >
                <Play className="size-3 fill-current" />
              </button>
              <div className="h-[3px] flex-1 overflow-hidden rounded-sm bg-border" />
            </div>
          )}
        </div>
      )
    }

    if (isVideo) {
      return (
        <div className="m-3 overflow-hidden rounded-md border border-dashed bg-muted/60">
          {preview.status === 'loading' ? (
            <div className="flex h-[260px] items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : preview.status === 'loaded' && preview.data?.type === 'url' ? (
            <video controls src={preview.data.url} className="max-h-[260px] w-full" />
          ) : (
            <div className="flex h-[260px] flex-col items-center justify-center gap-2">
              <FileIcon type="video" className="size-9 text-muted-foreground" />
              <span className="text-[11.5px] text-muted-foreground">{currentFile.mime}</span>
            </div>
          )}
        </div>
      )
    }

    if (preview.status === 'loading') {
      return (
        <div className="m-3 flex h-[260px] items-center justify-center rounded-md border border-dashed bg-muted/60">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (preview.status === 'loaded' && preview.data?.type === 'text') {
      return (
        <div className="m-3 flex h-[260px] flex-col overflow-hidden rounded-md border bg-muted/60">
          <div className="flex shrink-0 items-center border-b px-3 py-1.5">
            <FileIcon type={currentFile.type} className="mr-1.5 size-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">{currentFile.mime}</span>
          </div>
          {jsonResult.ok ? (
            <div className="flex-1 overflow-auto px-3 py-2">
              <JsonView value={jsonResult.value as object} style={JSON_VIEW_THEME} />
            </div>
          ) : (
            <pre className="flex-1 overflow-auto px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap break-all text-foreground/80">
              {preview.data.content}
            </pre>
          )}
        </div>
      )
    }

    return (
      <div className="m-3 flex h-[180px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/60">
        <FileIcon type={currentFile.type} className="size-9 text-muted-foreground" />
        <span className="text-[11.5px] text-muted-foreground">{currentFile.mime}</span>
      </div>
    )
  }

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
          {currentFile.name}
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

      {renderContent()}

      <div className="flex items-center justify-between gap-2 px-3.5 pb-3.5">
        {isImg ? (
          <>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="xs"
                disabled={imgIdx === 0}
                onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="size-3" />
                Prev
              </Button>
              <span className="flex items-center px-1 text-[11.5px] text-muted-foreground">
                {imgIdx + 1}/{imageSiblings.length}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={imgIdx >= imageSiblings.length - 1}
                onClick={() => setImgIdx((i) => Math.min(imageSiblings.length - 1, i + 1))}
              >
                Next
                <ChevronRight className="size-3" />
              </Button>
            </div>
            <div className="flex gap-0.5">
              <Button
                variant={zoom === '50' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setZoom('50')}
              >
                50%
              </Button>
              <Button
                variant={zoom === 'fit' ? 'default' : 'outline'}
                size="xs"
                onClick={() => setZoom('fit')}
              >
                Fit
              </Button>
              <Button
                variant={zoom === 'fill' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setZoom('fill')}
              >
                Fill
              </Button>
            </div>
          </>
        ) : (
          <div />
        )}
        <div className="ml-auto flex gap-1">
          <Button
            variant="outline"
            size="xs"
            disabled={downloadLoading}
            onClick={handleDownload}
          >
            {downloadLoading ? <Loader2 className="size-3 animate-spin" /> : <Download />}
            <span>Save</span>
          </Button>
          <Button
            variant="outline"
            size="xs"
            disabled={urlLoading}
            onClick={handleCopyPresigned}
          >
            {urlLoading ? <Loader2 className="size-3 animate-spin" /> : <Lock />}
            <span>URL</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

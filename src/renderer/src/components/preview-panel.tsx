import * as React from 'react'
import { Download, History, Link, Loader2, Lock, Trash2, X } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FileIcon } from '@/components/file-icon'
import { toastError, toastSuccess } from '@/lib/toast'
import type { S3File } from '@/lib/types'
import { cn } from '@/lib/utils'

type PreviewResult =
  | { type: 'url'; url: string }
  | { type: 'text'; content: string }
  | { type: 'none' }

type PreviewState = { status: 'idle' | 'loading' | 'loaded'; data: PreviewResult | null }

type PreviewPanelProps = {
  file: S3File
  bucket: string
  connId: string
  keyPrefix: string
  onClose: () => void
  onDeleted?: () => void
}

export function PreviewPanel({
  file,
  bucket,
  connId,
  keyPrefix,
  onClose,
  onDeleted
}: PreviewPanelProps): React.JSX.Element {
  const fullKey =
    file.type === 'folder' ? `${keyPrefix}${file.name}/` : `${keyPrefix}${file.name}`

  const [preview, setPreview] = React.useState<PreviewState>({ status: 'idle', data: null })
  const [downloadLoading, setDownloadLoading] = React.useState(false)
  const [copyUrlLoading, setCopyUrlLoading] = React.useState(false)
  const [copyPresignedLoading, setCopyPresignedLoading] = React.useState(false)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const previewable = file.type === 'image' || file.type === 'audio' || file.type === 'video' || file.type === 'text' || file.type === 'data'

  React.useEffect(() => {
    if (!previewable) {
      setPreview({ status: 'idle', data: null })
      return
    }
    let cancelled = false
    setPreview({ status: 'loading', data: null })
    window.api.files
      .getPreview({ connId, bucket, key: fullKey, fileType: file.type })
      .then((result) => {
        if (!cancelled) setPreview({ status: 'loaded', data: result })
      })
      .catch(() => {
        if (!cancelled) setPreview({ status: 'loaded', data: { type: 'none' } })
      })
    return () => {
      cancelled = true
    }
  }, [file.name, file.type, connId, bucket, fullKey, previewable])

  const handleDownload = async (): Promise<void> => {
    setDownloadLoading(true)
    try {
      const s = window.api.settings.getAllSync()
      const destPath = `${s.downloadPath}/${file.name}`
      const result = await window.api.files.download({ connId, bucket, key: fullKey, destPath })
      if (result.success) toastSuccess('Downloaded', file.name)
      else toastError('Download failed', result.error)
    } catch (err) {
      toastError('Download failed', err instanceof Error ? err.message : undefined)
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleCopyS3Url = async (): Promise<void> => {
    setCopyUrlLoading(true)
    try {
      const { url } = await window.api.files.getS3Url({ connId, bucket, key: fullKey })
      await navigator.clipboard.writeText(url)
      toastSuccess('Copied', 's3:// URL copied to clipboard')
    } catch (err) {
      toastError('Copy failed', err instanceof Error ? err.message : undefined)
    } finally {
      setCopyUrlLoading(false)
    }
  }

  const handleCopyPresigned = async (): Promise<void> => {
    setCopyPresignedLoading(true)
    try {
      const { url } = await window.api.files.getPresignedUrl({
        connId,
        bucket,
        key: fullKey,
        expiresIn: 3600
      })
      await navigator.clipboard.writeText(url)
      toastSuccess('Copied', 'Presigned URL (1 hour) copied to clipboard')
    } catch (err) {
      toastError('Copy failed', err instanceof Error ? err.message : undefined)
    } finally {
      setCopyPresignedLoading(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    setDeleteLoading(true)
    try {
      const result = await window.api.files.delete({ connId, bucket, key: fullKey })
      if (result.success) {
        toastSuccess('Deleted', file.name)
        onDeleted?.()
      } else {
        toastError('Delete failed', result.error)
      }
    } catch (err) {
      toastError('Delete failed', err instanceof Error ? err.message : undefined)
    } finally {
      setDeleteLoading(false)
    }
  }

  const metaRows: [string, string][] = [
    ['Size', file.size],
    ['Type', file.mime || '—'],
    ['Modified', file.modified],
    ['Key', `${bucket}/${keyPrefix}${file.name}`]
  ]

  const previewContainerHeight = file.type === 'audio' ? 'h-[60px]' : 'h-[120px]'

  const renderPreviewContent = (): React.ReactNode => {
    if (file.type === 'folder') {
      return (
        <>
          <FileIcon type="folder" className="size-10" />
          <span className="text-[11px] text-muted-foreground">Folder</span>
        </>
      )
    }

    if (preview.status === 'loading') {
      return <Loader2 className="size-5 animate-spin text-muted-foreground" />
    }

    if (preview.status === 'loaded' && preview.data) {
      const data = preview.data

      if (data.type === 'url' && file.type === 'image') {
        return (
          <img
            src={data.url}
            alt={file.name}
            className="max-h-full max-w-full object-contain rounded"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        )
      }

      if (data.type === 'url' && file.type === 'audio') {
        return <audio controls src={data.url} className="w-full mt-1" />
      }

      if (data.type === 'url' && file.type === 'video') {
        return (
          <video controls src={data.url} className="max-h-full max-w-full rounded" />
        )
      }

      if (data.type === 'text') {
        return (
          <pre className="text-[9px] leading-tight overflow-auto text-left px-2 text-muted-foreground whitespace-pre-wrap break-all">
            {data.content.slice(0, 200)}
          </pre>
        )
      }
    }

    return <FileIcon type={file.type} className="size-9 text-muted-foreground" />
  }

  const anyLoading = downloadLoading || copyUrlLoading || copyPresignedLoading || deleteLoading

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

      <div
        className={cn(
          'mx-3 mt-2.5 mb-1.5 shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/60',
          previewContainerHeight
        )}
      >
        {renderPreviewContent()}
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
        {file.type !== 'folder' ? (
          <>
            <Button
              variant="outline"
              size="xs"
              className="w-full justify-center"
              disabled={anyLoading}
              onClick={handleDownload}
            >
              {downloadLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Download />
              )}
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              className="w-full justify-center"
              disabled={anyLoading}
              onClick={handleCopyS3Url}
            >
              {copyUrlLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Link />
              )}
              <span>Copy S3 URL</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              className="w-full justify-center"
              disabled={anyLoading}
              onClick={handleCopyPresigned}
            >
              {copyPresignedLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Lock />
              )}
              <span>Copy Presigned URL</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              className="w-full justify-center opacity-50"
              disabled
            >
              <History />
              <span>Version History</span>
            </Button>
            <div className="my-0.5 border-t" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  className="w-full justify-center text-destructive hover:text-destructive"
                  disabled={anyLoading}
                >
                  {deleteLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 />
                  )}
                  <span>Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &ldquo;{file.name}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The file will be permanently removed from S3.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="xs"
              className="w-full justify-center"
              disabled={anyLoading}
              onClick={handleCopyS3Url}
            >
              {copyUrlLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Link />
              )}
              <span>Copy S3 URL</span>
            </Button>
            <div className="my-0.5 border-t" />
            <p className="text-center text-[10.5px] text-muted-foreground">
              Select files inside to delete
            </p>
          </>
        )}
      </div>
    </div>
  )
}

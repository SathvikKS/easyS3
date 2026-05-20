import * as React from 'react'
import { ChevronLeft, ChevronRight, File, Folder } from 'lucide-react'

import { ActionBar } from '@/components/action-bar'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { FileCard } from '@/components/file-card'
import { FileListHeader, FileRow } from '@/components/file-row'
import { FooterBar } from '@/components/footer-bar'
import { NavBar } from '@/components/nav-bar'
import { NewFolderCard, NewFolderRow } from '@/components/new-folder'
import { PreviewPanel } from '@/components/preview-panel'
import { sortFiles, type SortDirection, type SortField } from '@/lib/sort-files'
import { toastError, toastSuccess } from '@/lib/toast'
import type { Bucket, Connection, LayoutMode, S3File, ViewerContext } from '@/lib/types'

type DeleteItem = { key: string; displayName: string; isFolder: boolean }

function filterFiles(files: S3File[], query: string): S3File[] {
  const q = query.trim().toLowerCase()
  if (!q) return files
  return files.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.mime.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q) ||
      f.size.toLowerCase().includes(q)
  )
}

type ExplorerScreenProps = {
  conn: Connection
  bucket: Bucket
  layout: LayoutMode
  onLayout: (mode: LayoutMode) => void
  selFiles: Set<string>
  setSelFiles: (s: Set<string>) => void
  previewFile: S3File | null
  setPreviewFile: (f: S3File | null) => void
  setViewerFile: (ctx: ViewerContext | null) => void
  onCrumb: (idx: number) => void
}

export function ExplorerScreen({
  conn,
  bucket,
  layout,
  onLayout,
  selFiles,
  setSelFiles,
  previewFile,
  setPreviewFile,
  setViewerFile,
  onCrumb
}: ExplorerScreenProps): React.JSX.Element {
  const [path, setPath] = React.useState<string[]>([])
  const [newFolderName, setNewFolderName] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState<DeleteItem[]>([])
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sortField, setSortField] = React.useState<SortField>('name')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')

  // Real S3 data state
  const [realFiles, setRealFiles] = React.useState<S3File[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)
  const [pageTokens, setPageTokens] = React.useState<Array<string | undefined>>([undefined])
  const [pageIdx, setPageIdx] = React.useState(0)

  // Reset all state when bucket changes
  React.useEffect(() => {
    setPath([])
    setNewFolderName(null)
    setSearch('')
    setRealFiles([])
    setError(null)
    setIsTruncated(false)
    setPageTokens([undefined])
    setPageIdx(0)
  }, [bucket.name])

  // Reset pagination when path changes (but not bucket, that's handled above)
  React.useEffect(() => {
    setPageTokens([undefined])
    setPageIdx(0)
    setRealFiles([])
  }, [path])

  const fetchFiles = React.useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const prefix = path.length > 0 ? path.join('/') + '/' : ''
      const result = await window.api.files.list({
        connId: conn.id,
        bucket: bucket.name,
        prefix,
        continuationToken: pageTokens[pageIdx],
        maxKeys: 100
      })
      setRealFiles(result.files as S3File[])
      setIsTruncated(result.isTruncated)
      setPageTokens((prev) => {
        const next = [...prev]
        next[pageIdx + 1] = result.nextContinuationToken
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [conn.id, bucket.name, path, pageIdx, pageTokens])

  // Fetch whenever conn, bucket, path, or pageIdx changes
  React.useEffect(() => {
    void fetchFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn.id, bucket.name, path, pageIdx])

  const allFiles = realFiles

  const filteredFiles = React.useMemo(
    () => filterFiles(allFiles, debouncedSearch),
    [allFiles, debouncedSearch]
  )
  const sortedFiles = React.useMemo(
    () => sortFiles(filteredFiles, sortField, sortDirection),
    [filteredFiles, sortField, sortDirection]
  )

  const handleDownload = React.useCallback(async (): Promise<void> => {
    const selected = sortedFiles.filter((f) => selFiles.has(f.name) && f.type !== 'folder')
    if (selected.length === 0) return
    const prefix = path.length > 0 ? path.join('/') + '/' : ''
    try {
      const result = await window.api.files.download({
        connId: conn.id,
        bucket: bucket.name,
        files: selected.map((f) => ({ key: prefix + f.name, name: f.name }))
      })
      if (result.success) {
        const label = selected.length === 1 ? selected[0].name : `${selected.length} files`
        toastSuccess('Downloaded', label)
      } else if (!result.cancelled) {
        toastError('Download failed', result.error)
      }
    } catch (err) {
      toastError('Download failed', err instanceof Error ? err.message : undefined)
    }
  }, [conn.id, bucket.name, path, selFiles, sortedFiles])

  const handleDelete = React.useCallback((): void => {
    const prefix = path.length > 0 ? path.join('/') + '/' : ''
    const selected = sortedFiles.filter((f) => selFiles.has(f.name))
    if (selected.length === 0) return
    const items: DeleteItem[] = selected.map((f) => ({
      key: f.type === 'folder' ? prefix + f.name + '/' : prefix + f.name,
      displayName: f.type === 'folder' ? f.name + '/' : f.name,
      isFolder: f.type === 'folder'
    }))
    setPendingDelete(items)
    setDeleteConfirmOpen(true)
  }, [path, selFiles, sortedFiles])

  const confirmDelete = React.useCallback(async (): Promise<void> => {
    setDeleteConfirmOpen(false)
    const keys = pendingDelete.map((d) => d.key)
    try {
      const result = await window.api.files.delete({ connId: conn.id, bucket: bucket.name, keys })
      if (result.success) {
        const n = result.deleted
        toastSuccess('Deleted', `${n} item${n === 1 ? '' : 's'} deleted`)
        setSelFiles(new Set())
        void fetchFiles()
      } else {
        toastError('Delete failed', result.error)
      }
    } catch (err) {
      toastError('Delete failed', err instanceof Error ? err.message : undefined)
    }
    setPendingDelete([])
  }, [conn.id, bucket.name, pendingDelete, setSelFiles, fetchFiles])

  const handleUpload = React.useCallback(async (): Promise<void> => {
    const prefix = path.length > 0 ? path.join('/') + '/' : ''
    try {
      const result = await window.api.files.upload({ connId: conn.id, bucket: bucket.name, destPrefix: prefix })
      if (result.success) {
        const n = result.uploaded
        toastSuccess('Uploaded', `${n} file${n === 1 ? '' : 's'} uploaded`)
        void fetchFiles()
      } else if (!result.cancelled) {
        toastError('Upload failed', result.error)
      }
    } catch (err) {
      toastError('Upload failed', err instanceof Error ? err.message : undefined)
    }
  }, [conn.id, bucket.name, path, fetchFiles])

  const handleUploadFolder = React.useCallback(async (): Promise<void> => {
    const prefix = path.length > 0 ? path.join('/') + '/' : ''
    try {
      const result = await window.api.files.uploadFolder({ connId: conn.id, bucket: bucket.name, destPrefix: prefix })
      if (result.success) {
        const n = result.uploaded
        toastSuccess('Uploaded', `${n} file${n === 1 ? '' : 's'} uploaded`)
        void fetchFiles()
      } else if (!result.cancelled) {
        toastError('Upload failed', result.error)
      }
    } catch (err) {
      toastError('Upload failed', err instanceof Error ? err.message : undefined)
    }
  }, [conn.id, bucket.name, path, fetchFiles])

  const handleSort = (field: SortField): void => {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleNewFolder = (): void => {
    const names = new Set(allFiles.map((f) => f.name))
    let name = 'New Folder'
    let i = 2
    while (names.has(name)) {
      name = `New Folder (${i++})`
    }
    setNewFolderName(name)
  }

  const finalizeFolder = async (val: string): Promise<void> => {
    const trimmed = val.trim()
    setNewFolderName(null)
    if (!trimmed) return
    const prefix = path.length > 0 ? path.join('/') + '/' : ''
    try {
      const result = await window.api.files.createFolder({
        connId: conn.id,
        bucket: bucket.name,
        key: prefix + trimmed + '/'
      })
      if (result.success) {
        void fetchFiles()
      } else {
        toastError('Create folder failed', result.error)
      }
    } catch (err) {
      toastError('Create folder failed', err instanceof Error ? err.message : undefined)
    }
  }

  const allSel = selFiles.size === sortedFiles.length && sortedFiles.length > 0
  const someSel = selFiles.size > 0 && !allSel
  const toggleAll = (): void =>
    setSelFiles(allSel ? new Set() : new Set(sortedFiles.map((f) => f.name)))
  const toggleFile = (name: string): void => {
    const s = new Set(selFiles)
    if (s.has(name)) s.delete(name)
    else s.add(name)
    setSelFiles(s)
  }

  const resetPagination = (): void => {
    setPageTokens([undefined])
    setPageIdx(0)
  }

  const navigateIntoFolder = (folder: S3File): void => {
    setPath((prev) => [...prev, folder.name])
    setSelFiles(new Set())
    setPreviewFile(null)
    setViewerFile(null)
    resetPagination()
  }

  const handleOpenItem = (file: S3File): void => {
    if (file.type === 'folder') {
      navigateIntoFolder(file)
    } else {
      setViewerFile({
        file,
        connId: conn.id,
        bucket: bucket.name,
        keyPrefix: path.length > 0 ? path.join('/') + '/' : '',
        siblings: sortedFiles.filter((f) => f.type !== 'folder')
      })
    }
  }

  const previewTimerRef = React.useRef<number | null>(null)

  const handleClick = (file: S3File): void => {
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current)
    }
    previewTimerRef.current = window.setTimeout(() => {
      previewTimerRef.current = null
      setPreviewFile(file)
    }, 250)
  }

  const handleDoubleClick = (file: S3File): void => {
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current)
      previewTimerRef.current = null
    }
    handleOpenItem(file)
  }

  const handleNavCrumb = (idx: number): void => {
    if (idx === 0) {
      onCrumb(0)
    } else if (idx === 1) {
      setPath([])
      setSelFiles(new Set())
      setPreviewFile(null)
      resetPagination()
    } else {
      setPath((prev) => prev.slice(0, idx - 1))
      setSelFiles(new Set())
      setPreviewFile(null)
      resetPagination()
    }
  }

  const handleNavigate = async (rawPath: string): Promise<void> => {
    const trimmed = rawPath.trim()
    if (!trimmed) return

    let segments: string[] = []

    if (trimmed.startsWith('s3://')) {
      const parts = trimmed.slice(5).split('/').filter(Boolean)
      if (parts[0] !== bucket.name) {
        toastError('Navigation failed', 'Path belongs to a different bucket')
        return
      }
      segments = parts.slice(1)
    } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed)
        const pathParts = url.pathname.split('/').filter(Boolean)
        const hostBucket = url.hostname.startsWith(bucket.name + '.') ? bucket.name : null
        if (hostBucket) {
          segments = pathParts
        } else if (pathParts[0] === bucket.name) {
          segments = pathParts.slice(1)
        } else {
          toastError('Navigation failed', 'URL belongs to a different bucket')
          return
        }
      } catch {
        toastError('Navigation failed', 'Invalid URL')
        return
      }
    } else {
      const parts = trimmed.split('/').map((s) => s.trim()).filter(Boolean)
      if (parts.length < 2 || parts[1] !== bucket.name) {
        toastError('Navigation failed', 'Path belongs to a different bucket')
        return
      }
      segments = parts.slice(2)
    }

    const lastSeg = segments[segments.length - 1]
    const isLikelyFile = lastSeg && lastSeg.includes('.') && !lastSeg.endsWith('/')
    const pathToSet = isLikelyFile ? segments.slice(0, -1) : segments

    if (pathToSet.length > 0) {
      try {
        const prefix = pathToSet.join('/') + '/'
        const result = await window.api.files.list({
          connId: conn.id,
          bucket: bucket.name,
          prefix,
          maxKeys: 1
        })
        if (result.files.length === 0 && !result.isTruncated) {
          toastError('Path not found', prefix)
          return
        }
      } catch {
        toastError('Path not found', pathToSet.join('/'))
        return
      }
    }

    setPath(pathToSet)
    setSelFiles(new Set())
    setPreviewFile(null)
    setViewerFile(null)
    resetPagination()
  }

  const goUpOneLevel = (): void => {
    if (path.length > 0) {
      setPath((prev) => prev.slice(0, -1))
      setSelFiles(new Set())
      setPreviewFile(null)
      resetPagination()
    } else {
      onCrumb(0)
    }
  }

  const goNextPage = (): void => {
    setPageIdx((prev) => prev + 1)
  }
  const goPrevPage = (): void => {
    setPageIdx((prev) => Math.max(0, prev - 1))
  }

  const showPagination = pageIdx > 0 || isTruncated

  const paginationBar = showPagination ? (
    <div className="flex shrink-0 items-center justify-between border-t bg-background px-3 py-1.5">
      <Button variant="ghost" size="xs" disabled={pageIdx === 0 || loading} onClick={goPrevPage}>
        <ChevronLeft className="size-3.5" />
        <span>Previous</span>
      </Button>
      <span className="text-[11.5px] text-muted-foreground">Page {pageIdx + 1}</span>
      <Button variant="ghost" size="xs" disabled={!isTruncated || loading} onClick={goNextPage}>
        <span>Next</span>
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  ) : null

  const skeletonRows = loading && realFiles.length === 0
    ? [...Array(8)].map((_, i) => (
        <div
          key={i}
          className="grid h-9 grid-cols-[32px_1fr_80px_120px_34px] items-center border-b pr-1"
        >
          <div className="flex justify-center px-2">
            <div className="size-3.5 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-3.5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-3 w-12 rounded bg-muted animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          <div />
        </div>
      ))
    : null

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <NavBar
          crumbs={[
            { label: conn.name },
            { label: bucket.name },
            ...path.map((segment) => ({ label: segment }))
          ]}
          canBack
          canFwd={false}
          onBack={goUpOneLevel}
          onUp={goUpOneLevel}
          onCrumb={handleNavCrumb}
          onNavigate={handleNavigate}
        />
        <ActionBar
          selCount={selFiles.size}
          layout={layout}
          search={search}
          onSearchChange={setSearch}
          onLayout={onLayout}
          onUpload={handleUpload}
          onUploadFolder={handleUploadFolder}
          onNewFolder={handleNewFolder}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
        {layout === 'list' ? (
          <>
            <FileListHeader
              allSelected={allSel}
              someSelected={someSel}
              onToggleAll={toggleAll}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <div className="flex-1 overflow-y-auto min-h-0">
              {newFolderName !== null && (
                <NewFolderRow name={newFolderName} onFinalize={finalizeFolder} />
              )}
              {skeletonRows}
              {error && (
                <div className="px-4 py-8 text-center">
                  <p className="text-[12.5px] text-destructive">{error}</p>
                  <button
                    type="button"
                    onClick={fetchFiles}
                    className="mt-2 text-[12px] text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}
              {!loading && !error && sortedFiles.length === 0 && debouncedSearch.trim() ? (
                <div className="px-3.5 py-8 text-center text-[12.5px] text-muted-foreground">
                  No files match{' '}
                  <span className="font-medium text-foreground/80">
                    &ldquo;{debouncedSearch.trim()}&rdquo;
                  </span>
                </div>
              ) : null}
              {sortedFiles.map((f) => (
                <FileRow
                  key={f.name}
                  file={f}
                  selected={selFiles.has(f.name)}
                  onSelect={() => toggleFile(f.name)}
                  onClick={() => handleClick(f)}
                  onDoubleClick={() => handleDoubleClick(f)}
                />
              ))}
            </div>
            {paginationBar}
          </>
        ) : (
          <>
            <div className="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto p-3 min-h-0">
              {newFolderName !== null && (
                <NewFolderCard name={newFolderName} onFinalize={finalizeFolder} />
              )}
              {!loading && !error && sortedFiles.length === 0 && debouncedSearch.trim() ? (
                <div className="w-full px-3.5 py-8 text-center text-[12.5px] text-muted-foreground">
                  No files match{' '}
                  <span className="font-medium text-foreground/80">
                    &ldquo;{debouncedSearch.trim()}&rdquo;
                  </span>
                </div>
              ) : null}
              {error && (
                <div className="w-full px-4 py-8 text-center">
                  <p className="text-[12.5px] text-destructive">{error}</p>
                  <button
                    type="button"
                    onClick={fetchFiles}
                    className="mt-2 text-[12px] text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}
              {sortedFiles.map((f) => (
                <FileCard
                  key={f.name}
                  file={f}
                  selected={selFiles.has(f.name)}
                  onSelect={() => toggleFile(f.name)}
                  onClick={() => handleClick(f)}
                  onDoubleClick={() => handleDoubleClick(f)}
                />
              ))}
            </div>
            {paginationBar}
          </>
        )}
        <FooterBar
          bucket={bucket.name}
          region={bucket.region}
          count={debouncedSearch.trim() ? sortedFiles.length : realFiles.length}
          usedGb={2.1}
          totalGb={10}
        />
      </div>
      {previewFile && (
        <PreviewPanel
          file={previewFile}
          bucket={bucket.name}
          connId={conn.id}
          keyPrefix={path.length > 0 ? path.join('/') + '/' : ''}
          onClose={() => setPreviewFile(null)}
          onDeleted={() => {
            setPreviewFile(null)
            void fetchFiles()
          }}
        />
      )}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete.length} item{pendingDelete.length !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/30 px-3 py-2">
            {pendingDelete.map((d) => (
              <div key={d.key} className="flex items-center gap-1.5 py-0.5 text-[12px]">
                {d.isFolder ? (
                  <Folder className="size-3 shrink-0 text-muted-foreground" />
                ) : (
                  <File className="size-3 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate font-mono text-[11.5px]">{d.displayName}</span>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

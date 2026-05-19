import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { ActionBar } from '@/components/action-bar'
import { Button } from '@/components/ui/button'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { FileCard } from '@/components/file-card'
import { FileListHeader, FileRow } from '@/components/file-row'
import { FooterBar } from '@/components/footer-bar'
import { NavBar } from '@/components/nav-bar'
import { NewFolderCard, NewFolderRow } from '@/components/new-folder'
import { PreviewPanel } from '@/components/preview-panel'
import { sortFiles, type SortDirection, type SortField } from '@/lib/sort-files'
import type { Bucket, Connection, LayoutMode, S3File } from '@/lib/types'

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
  setViewerFile: (f: S3File | null) => void
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

  const finalizeFolder = (val: string): void => {
    const trimmed = val.trim()
    if (trimmed) {
      setRealFiles((prev) => [
        { name: trimmed, type: 'folder', size: '—', modified: 'just now', mime: 'folder' },
        ...prev
      ])
    }
    setNewFolderName(null)
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
      setViewerFile(file)
    }
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
        />
        <ActionBar
          selCount={selFiles.size}
          layout={layout}
          search={search}
          onSearchChange={setSearch}
          onLayout={onLayout}
          onNewFolder={handleNewFolder}
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
                  onClick={() => setPreviewFile(f)}
                  onDoubleClick={() => handleOpenItem(f)}
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
                  onClick={() => setPreviewFile(f)}
                  onDoubleClick={() => handleOpenItem(f)}
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
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}

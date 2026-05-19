import * as React from 'react'

import { ActionBar } from '@/components/action-bar'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { FileCard } from '@/components/file-card'
import { FileListHeader, FileRow } from '@/components/file-row'
import { FooterBar } from '@/components/footer-bar'
import { NavBar } from '@/components/nav-bar'
import { NewFolderCard, NewFolderRow } from '@/components/new-folder'
import { PreviewPanel } from '@/components/preview-panel'
import { getFilesAtPath } from '@/lib/data'
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
  const [extraFolders, setExtraFolders] = React.useState<S3File[]>([])
  const [newFolderName, setNewFolderName] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sortField, setSortField] = React.useState<SortField>('name')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')

  React.useEffect(() => {
    setPath([])
    setExtraFolders([])
    setNewFolderName(null)
    setSearch('')
  }, [bucket.name])

  const baseFiles = React.useMemo(() => getFilesAtPath(path), [path])
  const allFiles = React.useMemo(() => [...extraFolders, ...baseFiles], [extraFolders, baseFiles])
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
      setExtraFolders((prev) => [
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

  const navigateIntoFolder = (folder: S3File): void => {
    setPath((prev) => [...prev, folder.name])
    setSelFiles(new Set())
    setPreviewFile(null)
    setViewerFile(null)
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
    } else {
      setPath((prev) => prev.slice(0, idx - 1))
      setSelFiles(new Set())
      setPreviewFile(null)
    }
  }

  const goUpOneLevel = (): void => {
    if (path.length > 0) {
      setPath((prev) => prev.slice(0, -1))
      setSelFiles(new Set())
      setPreviewFile(null)
    } else {
      onCrumb(0)
    }
  }

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
          <div className="flex-1 overflow-y-auto">
            <FileListHeader
              allSelected={allSel}
              someSelected={someSel}
              onToggleAll={toggleAll}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            {newFolderName !== null && (
              <NewFolderRow name={newFolderName} onFinalize={finalizeFolder} />
            )}
            {sortedFiles.length === 0 && debouncedSearch.trim() ? (
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
        ) : (
          <div className="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto p-3">
            {newFolderName !== null && (
              <NewFolderCard name={newFolderName} onFinalize={finalizeFolder} />
            )}
            {sortedFiles.length === 0 && debouncedSearch.trim() ? (
              <div className="w-full px-3.5 py-8 text-center text-[12.5px] text-muted-foreground">
                No files match{' '}
                <span className="font-medium text-foreground/80">
                  &ldquo;{debouncedSearch.trim()}&rdquo;
                </span>
              </div>
            ) : null}
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
        )}
        <FooterBar
          bucket={bucket.name}
          region={bucket.region}
          count={debouncedSearch.trim() ? sortedFiles.length : allFiles.length}
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

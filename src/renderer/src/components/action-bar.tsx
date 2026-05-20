import * as React from 'react'
import {
  Download,
  FolderUp,
  Grid2x2,
  Link,
  List,
  MoreHorizontal,
  Search,
  Trash2,
  Upload
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { LayoutMode } from '@/lib/types'

type ActionBarProps = {
  selCount: number
  layout: LayoutMode
  search: string
  onSearchChange: (value: string) => void
  onLayout: (mode: LayoutMode) => void
  onUpload?: () => void
  onUploadFolder?: () => void
  onNewFolder?: () => void
  onDelete?: () => void
  onCopyUrl?: () => void
  onDownload?: () => void
}

export function ActionBar({
  selCount,
  layout,
  search,
  onSearchChange,
  onLayout,
  onUpload,
  onUploadFolder,
  onNewFolder,
  onDelete,
  onCopyUrl,
  onDownload
}: ActionBarProps): React.JSX.Element {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-1.5 border-b bg-background px-2.5">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="xs" onClick={onUpload}>
          <Upload />
          <span>Upload</span>
        </Button>
        <Button variant="outline" size="xs" onClick={onUploadFolder}>
          <FolderUp />
          <span>Upload Folder</span>
        </Button>
        <Button variant="outline" size="xs" onClick={onNewFolder}>
          New Folder
        </Button>
        <Button variant="ghost" size="icon-xs" aria-label="More">
          <MoreHorizontal />
        </Button>
        {selCount > 0 && (
          <>
            <Separator orientation="vertical" className="!h-4" />
            <span className="flex h-[22px] items-center rounded-md bg-[color:var(--info-soft)] px-2 text-[11.5px] font-medium text-[color:var(--info)]">
              {selCount} selected
            </span>
            <Button variant="outline" size="xs" onClick={onDelete}>
              <Trash2 />
              <span>Delete</span>
            </Button>
            <Button variant="outline" size="xs" onClick={onCopyUrl}>
              <Link />
              <span>Copy URL</span>
            </Button>
            <Button variant="outline" size="xs" onClick={onDownload}>
              <Download />
              <span>Download</span>
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <div className="flex h-[26px] w-[180px] items-center gap-1.5 rounded-md border bg-background px-2 transition-colors focus-within:border-[color:var(--info)] focus-within:shadow-[0_0_0_2px_var(--info-soft)]">
          <Search className="size-3 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        <Separator orientation="vertical" className="!h-4" />
        <span className="text-[11px] text-muted-foreground/70">View</span>
        <div className="flex overflow-hidden rounded-md border">
          <LayoutToggle active={layout === 'grid'} onClick={() => onLayout('grid')}>
            <Grid2x2 className="size-[13px]" />
          </LayoutToggle>
          <LayoutToggle active={layout === 'list'} onClick={() => onLayout('list')}>
            <List className="size-[13px]" />
          </LayoutToggle>
        </div>
      </div>
    </div>
  )
}

type LayoutToggleProps = {
  active?: boolean
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

function LayoutToggle(props: LayoutToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        'flex h-[26px] w-[27px] items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        props.active && 'bg-accent text-foreground',
        props.className
      )}
    >
      {props.children}
    </button>
  )
}

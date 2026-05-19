import * as React from 'react'
import { ArrowDown, ArrowUp, MoreHorizontal } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { FileIcon } from '@/components/file-icon'
import type { SortDirection, SortField } from '@/lib/sort-files'
import type { S3File } from '@/lib/types'

type FileRowProps = {
  file: S3File
  selected: boolean
  onSelect: () => void
  onClick: () => void
  onDoubleClick: () => void
}

export function FileListHeader({
  allSelected,
  someSelected,
  onToggleAll,
  sortField,
  sortDirection,
  onSort
}: {
  allSelected: boolean
  someSelected: boolean
  onToggleAll: () => void
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}): React.JSX.Element {
  return (
    <div className="sticky top-0 z-[1] grid h-[30px] grid-cols-[32px_1fr_80px_120px_34px] items-center border-b bg-muted/60 pr-1 text-[11.5px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          onCheckedChange={onToggleAll}
          className="size-3.5"
        />
      </div>
      <SortableHeader
        label="Name"
        field="name"
        activeField={sortField}
        direction={sortDirection}
        onSort={onSort}
      />
      <SortableHeader
        label="Size"
        field="size"
        activeField={sortField}
        direction={sortDirection}
        onSort={onSort}
      />
      <SortableHeader
        label="Modified"
        field="modified"
        activeField={sortField}
        direction={sortDirection}
        onSort={onSort}
      />
      <div />
    </div>
  )
}

function SortableHeader({
  label,
  field,
  activeField,
  direction,
  onSort
}: {
  label: string
  field: SortField
  activeField: SortField
  direction: SortDirection
  onSort: (field: SortField) => void
}): React.JSX.Element {
  const active = activeField === field
  const SortIcon = direction === 'asc' ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-0.5 pr-2 text-left transition-colors hover:text-foreground',
        active && 'text-foreground'
      )}
    >
      <span>{label}</span>
      {active && <SortIcon className="size-3 shrink-0 opacity-80" />}
    </button>
  )
}

export function FileRow({
  file,
  selected,
  onSelect,
  onClick,
  onDoubleClick
}: FileRowProps): React.JSX.Element {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'group grid h-9 cursor-pointer grid-cols-[32px_1fr_80px_120px_34px] items-center border-b pr-1 transition-colors',
        selected
          ? 'bg-[color:var(--info-soft)] hover:bg-[color:var(--info-soft)]'
          : 'hover:bg-muted/60'
      )}
    >
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="size-3.5"
        />
      </div>
      <div className="flex items-center gap-1.5 overflow-hidden pr-2">
        <FileIcon
          type={file.type}
          className={cn('size-3.5 shrink-0', file.type !== 'folder' && 'text-muted-foreground')}
        />
        <span className={cn('truncate text-[12.5px]', selected && 'text-[color:var(--info)]')}>
          {file.name}
        </span>
      </div>
      <div className="pr-2 text-[11.5px] text-muted-foreground">{file.size}</div>
      <div className="pr-2 text-[11.5px] text-muted-foreground">{file.modified}</div>
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex size-[22px] items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
        >
          <MoreHorizontal className="size-[14px]" />
        </button>
      </div>
    </div>
  )
}

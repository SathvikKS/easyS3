import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { FileIcon } from '@/components/file-icon'
import type { S3File } from '@/lib/types'

type FileCardProps = {
  file: S3File
  selected: boolean
  onSelect: () => void
  onClick: () => void
  onDoubleClick: () => void
}

export function FileCard({
  file,
  selected,
  onSelect,
  onClick,
  onDoubleClick
}: FileCardProps): React.JSX.Element {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'group relative flex w-[100px] cursor-pointer flex-col items-center gap-1.5 rounded-lg border bg-background px-2 pt-3 pb-2.5 transition-colors',
        selected
          ? 'border-[color:var(--info)] bg-[color:var(--info-soft)] hover:bg-[color:var(--info-soft)]'
          : 'hover:bg-muted/60'
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        className={cn(
          'absolute top-1.5 left-1.5 flex size-3.5 cursor-pointer items-center justify-center rounded-[3px] border text-[9px] transition-opacity',
          selected
            ? 'border-[color:var(--info)] bg-[color:var(--info)] text-white opacity-100'
            : 'border-border bg-background opacity-0 group-hover:opacity-100'
        )}
      >
        {selected && <Check className="size-2.5" />}
      </button>
      <FileIcon
        type={file.type}
        className={cn('size-[30px]', file.type !== 'folder' && 'text-muted-foreground')}
      />
      <span className="line-clamp-2 max-h-[30px] text-center text-[11.5px] leading-[1.3] break-words">
        {file.name}
      </span>
      <span className="text-[10.5px] text-muted-foreground">{file.size}</span>
    </div>
  )
}

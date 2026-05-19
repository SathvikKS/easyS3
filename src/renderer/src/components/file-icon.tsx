import {
  File,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { S3FileType } from '@/lib/types'

type FileIconProps = {
  type: S3FileType
  className?: string
}

export function FileIcon({ type, className }: FileIconProps): React.JSX.Element {
  switch (type) {
    case 'folder':
      return <Folder className={cn('text-[color:var(--info)]', className)} />
    case 'image':
      return <FileImage className={className} />
    case 'audio':
      return <FileAudio className={className} />
    case 'video':
      return <FileVideo className={className} />
    case 'data':
      return <FileSpreadsheet className={className} />
    case 'text':
      return <FileText className={className} />
    default:
      return <File className={className} />
  }
}

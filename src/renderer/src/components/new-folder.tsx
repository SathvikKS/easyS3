import * as React from 'react'
import { Folder } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'

type NewFolderProps = {
  name: string
  onFinalize: (val: string) => void
}

export function NewFolderRow({ name, onFinalize }: NewFolderProps): React.JSX.Element {
  const [val, setVal] = React.useState(name)
  const finish = (): void => onFinalize(val)
  return (
    <div className="grid h-9 grid-cols-[32px_1fr_80px_120px_34px] items-center border-b bg-[color:var(--info-soft)] pr-1">
      <div className="flex items-center justify-center px-2">
        <Checkbox disabled className="size-3.5" />
      </div>
      <div className="flex items-center gap-1.5 overflow-hidden pr-2">
        <Folder className="size-3.5 shrink-0 text-[color:var(--info)]" />
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={finish}
          onKeyDown={(e) => {
            if (e.key === 'Enter') finish()
            if (e.key === 'Escape') onFinalize('')
          }}
          className="w-[170px] rounded-md border border-[color:var(--info)] bg-background px-1.5 py-px text-[12.5px] text-foreground shadow-[0_0_0_2px_var(--info-soft)] outline-none"
        />
      </div>
      <div className="pr-2 text-[11.5px] text-muted-foreground">—</div>
      <div className="pr-2 text-[11.5px] text-muted-foreground">just now</div>
      <div />
    </div>
  )
}

export function NewFolderCard({ name, onFinalize }: NewFolderProps): React.JSX.Element {
  const [val, setVal] = React.useState(name)
  const finish = (): void => onFinalize(val)
  return (
    <div className="relative flex w-[100px] flex-col items-center gap-1.5 rounded-lg border border-[color:var(--info)] bg-[color:var(--info-soft)] px-2 pt-3 pb-2.5">
      <Folder className="size-[30px] text-[color:var(--info)]" />
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === 'Enter') finish()
          if (e.key === 'Escape') onFinalize('')
        }}
        className="w-[84px] rounded-md border border-[color:var(--info)] bg-background px-1 py-px text-center text-[11.5px] text-foreground shadow-[0_0_0_2px_var(--info-soft)] outline-none"
      />
      <span className="text-[10.5px] text-muted-foreground">—</span>
    </div>
  )
}

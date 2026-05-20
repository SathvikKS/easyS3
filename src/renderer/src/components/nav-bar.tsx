import * as React from 'react'
import { ArrowLeft, ArrowRight, ArrowUp, ChevronRight, Pencil } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type Crumb = {
  label: string
}

type NavBarProps = {
  crumbs: Crumb[]
  canBack?: boolean
  canFwd?: boolean
  onBack?: () => void
  onFwd?: () => void
  onUp?: () => void
  onCrumb?: (index: number) => void
  onNavigate?: (rawPath: string) => void
}

function formatPath(raw: string): string {
  return raw
    .split('/')
    .map((s) => s.trim())
    .join(' / ')
    .replace(/\s{2,}/g, ' ')
}

export function NavBar({
  crumbs,
  canBack = false,
  canFwd = false,
  onBack,
  onFwd,
  onUp,
  onCrumb,
  onNavigate
}: NavBarProps): React.JSX.Element {
  const [editing, setEditing] = React.useState(false)
  const [val, setVal] = React.useState('')

  const openEdit = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setVal(crumbs.map((c) => c.label).join(' / '))
    setEditing(true)
  }

  return (
    <div className="flex h-[38px] shrink-0 items-center gap-1 border-b bg-background px-2.5">
      <div className="flex items-center gap-px">
        <NavButton onClick={onBack} disabled={!canBack} aria-label="Back">
          <ArrowLeft className="size-[13px]" />
        </NavButton>
        <NavButton onClick={onFwd} disabled={!canFwd} aria-label="Forward">
          <ArrowRight className="size-[13px]" />
        </NavButton>
        <NavButton onClick={onUp} aria-label="Up">
          <ArrowUp className="size-[13px]" />
        </NavButton>
      </div>
      <Separator orientation="vertical" className="mx-1 !h-4" />
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => {
            const raw = e.target.value
            setVal(raw.endsWith('/') ? formatPath(raw) : raw)
          }}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onNavigate?.(val.trim())
              setEditing(false)
            } else if (e.key === 'Escape') {
              setEditing(false)
            }
          }}
          className="h-[26px] flex-1 rounded-md border border-[color:var(--info)] bg-background px-2 font-mono text-[11.5px] text-foreground shadow-[0_0_0_2px_var(--info-soft)] outline-none"
        />
      ) : (
        <div className="group flex h-7 min-w-0 flex-1 items-center gap-0 overflow-hidden rounded-md px-1 transition-colors hover:bg-accent">
          {crumbs.map((c, i) => (
            <React.Fragment key={`${i}-${c.label}`}>
              {i > 0 && (
                <ChevronRight className="mx-px size-[11px] shrink-0 text-muted-foreground/60" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (i < crumbs.length - 1) onCrumb?.(i)
                }}
                className={cn(
                  'inline-flex h-6 items-center whitespace-nowrap rounded-md border-none bg-transparent px-1.5 text-[12.5px] transition-colors',
                  i === crumbs.length - 1
                    ? 'cursor-default font-medium text-foreground'
                    : 'cursor-pointer text-muted-foreground hover:text-foreground'
                )}
              >
                {c.label}
              </button>
            </React.Fragment>
          ))}
          <button
            type="button"
            onClick={openEdit}
            title="Edit path"
            className="ml-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-60"
          >
            <Pencil className="size-[11px]" />
          </button>
        </div>
      )}
    </div>
  )
}

type NavButtonProps = {
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  onClick?: () => void
  'aria-label'?: string
}

function NavButton(props: NavButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      aria-label={props['aria-label']}
      className={cn(
        'flex size-[27px] shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors',
        props.disabled ? 'cursor-default opacity-30' : 'hover:bg-accent hover:text-foreground',
        props.className
      )}
    >
      {props.children}
    </button>
  )
}

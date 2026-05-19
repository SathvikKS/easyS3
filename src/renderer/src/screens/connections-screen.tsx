import { ArrowRight, Copy, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { SAMPLE_CONNECTIONS } from '@/lib/data'
import type { Connection } from '@/lib/types'

type ConnectionsScreenProps = {
  onOpen: (conn: Connection) => void
  onConnect: (conn: Connection) => void
  onAdd: () => void
  onEdit: (conn: Connection) => void
  connections?: Connection[]
}

export function ConnectionsScreen({
  onOpen,
  onConnect,
  onAdd,
  onEdit,
  connections = SAMPLE_CONNECTIONS
}: ConnectionsScreenProps): React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-7 animate-in fade-in">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Connections</h1>
        <Button size="sm" onClick={onAdd}>
          <Plus />
          <span>Add Connection</span>
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[18px_200px_1fr_190px_80px_170px] gap-3 border-b bg-muted/60 px-4 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
          <span />
          <span>Name</span>
          <span>Endpoint</span>
          <span>Status</span>
          <span>Buckets</span>
          <span />
        </div>
        {connections.map((c) => {
          const isConnected = c.status === 'connected'
          return (
            <div
              key={c.name}
              role="button"
              tabIndex={0}
              onClick={() => (isConnected ? onOpen(c) : onConnect(c))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  isConnected ? onOpen(c) : onConnect(c)
                }
              }}
              className="grid cursor-pointer grid-cols-[18px_200px_1fr_190px_80px_170px] items-center gap-3 border-b px-4 py-3 transition-colors last:border-none hover:bg-muted/60"
            >
              <span
                className={cn(
                  'size-2 rounded-full',
                  isConnected
                    ? 'bg-[color:var(--success)] shadow-[0_0_0_2px_var(--success-soft)]'
                    : 'bg-muted-foreground/40'
                )}
              />
              <span className="text-[13px] font-medium">{c.name}</span>
              <span className="truncate font-mono text-[11.5px] text-muted-foreground">
                {c.endpoint}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'text-[12.5px] font-medium',
                    isConnected ? 'text-[color:var(--success)]' : 'text-muted-foreground'
                  )}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                <span className="text-[11.5px] text-muted-foreground">· {c.lastSeen}</span>
              </div>
              <span className="text-[12.5px] text-muted-foreground">{c.buckets ?? '—'}</span>
              <div
                className="flex items-center justify-end gap-1"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                {isConnected ? (
                  <Button variant="outline" size="xs" onClick={() => onOpen(c)}>
                    <span>Open</span>
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button variant="outline" size="xs" onClick={() => onConnect(c)}>
                    Connect
                  </Button>
                )}
                <Button variant="ghost" size="icon-xs" aria-label="Edit" onClick={() => onEdit(c)}>
                  <Pencil />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs" aria-label="More">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuItem>
                      <Copy />
                      <span>Duplicate</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <RefreshCw />
                      <span>Reconnect</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Trash2 />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

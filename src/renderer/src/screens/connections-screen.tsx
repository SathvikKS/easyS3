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
import type { Connection } from '@/lib/types'

type ConnectionsScreenProps = {
  connections: Connection[]
  connectingId: string | null
  onOpen: (conn: Connection) => void
  onConnect: (conn: Connection) => void
  onAdd: () => void
  onEdit: (conn: Connection) => void
  onDelete: (conn: Connection) => void
  onDuplicate: (conn: Connection) => void
}

export function ConnectionsScreen({
  connections,
  connectingId,
  onOpen,
  onConnect,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate
}: ConnectionsScreenProps): React.JSX.Element {
  return (
    <div className="flex flex-col flex-1 overflow-hidden px-8 py-7 animate-in fade-in">
      <div className="mb-5 flex shrink-0 items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Connections</h1>
        <Button size="sm" onClick={onAdd}>
          <Plus />
          <span>Add Connection</span>
        </Button>
      </div>
      {connections.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-20 text-[13px] text-muted-foreground">
          No connections configured — click <span className="mx-1 font-medium text-foreground/70">Add Connection</span> to get started.
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[18px_200px_1fr_190px_80px_170px] shrink-0 gap-3 border-b bg-muted/60 px-4 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
            <span />
            <span>Name</span>
            <span>Endpoint</span>
            <span>Status</span>
            <span>Buckets</span>
            <span />
          </div>
          <div className="flex-1 overflow-y-auto">
          {connections.map((c) => {
            const isConnected = c.status === 'connected'
            const isConnecting = connectingId === c.id
            return (
              <div
                key={c.id}
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
                  {c.lastSeen ? (
                    <span className="text-[11.5px] text-muted-foreground">· {c.lastSeen}</span>
                  ) : null}
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
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={isConnecting}
                      onClick={() => onConnect(c)}
                    >
                      {isConnecting ? (
                        <RefreshCw className="animate-spin" />
                      ) : (
                        <span>Connect</span>
                      )}
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
                      <DropdownMenuItem onClick={() => onDuplicate(c)}>
                        <Copy />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onConnect(c)}>
                        <RefreshCw />
                        <span>Reconnect</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(c)}>
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
      )}
    </div>
  )
}

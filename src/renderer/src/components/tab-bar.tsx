import { Home, Package, Plus, Settings, X } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Tab } from '@/lib/types'

type TabBarProps = {
  tabs: Tab[]
  activeTabId: string | null
  onHome: () => void
  onTab: (tabId: string) => void
  onClose: (tabId: string) => void
  onNew: () => void
  onOpenSettings?: () => void
}

export function TabBar({
  tabs,
  activeTabId,
  onHome,
  onTab,
  onClose,
  onNew,
  onOpenSettings
}: TabBarProps): React.JSX.Element {
  return (
    <div className="flex h-[38px] shrink-0 items-center justify-between border-b bg-[color:var(--tabbar)] px-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        <button
          type="button"
          onClick={onHome}
          title="All Connections"
          className="flex h-[26px] shrink-0 items-center gap-1.5 rounded-md border border-border bg-transparent px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Home className="size-3" />
          <span>All</span>
        </button>
        {tabs.length > 0 && <Separator orientation="vertical" className="mx-1 !h-4" />}
        <div className="flex min-w-0 items-center gap-0.5 overflow-hidden">
          {tabs.map((t) => {
            const isActive = activeTabId === t.tabId
            return (
              <button
                key={t.tabId}
                type="button"
                title={t.activeBucket ? `${t.conn.name} — ${t.activeBucket.name}` : t.conn.name}
                onClick={() => onTab(t.tabId)}
                className={cn(
                  'group flex h-[26px] max-w-[160px] shrink-0 items-center gap-1.5 overflow-hidden rounded-md border px-2 text-xs transition-colors',
                  isActive
                    ? 'border-border bg-[color:var(--tab-active)] text-foreground shadow-sm'
                    : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Package className="size-2.5 shrink-0" />
                <span className="max-w-[110px] truncate">
                  {t.activeBucket ? `${t.conn.name} / ${t.activeBucket.name}` : t.conn.name}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose(t.tabId)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      onClose(t.tabId)
                    }
                  }}
                  className="flex size-[13px] shrink-0 items-center justify-center rounded-sm opacity-40 transition-opacity hover:opacity-100"
                >
                  <X className="size-2.5" />
                </span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={onNew}
            title="New connection"
            className="flex size-[26px] shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>
      {onOpenSettings && (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSettings}
            title="Settings"
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="size-[14px]" />
          </button>
        </div>
      )}
    </div>
  )
}

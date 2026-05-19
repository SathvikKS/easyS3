import * as React from 'react'
import { ArrowRight, Clock, File, HardDrive, Package, Search, Settings } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { SAMPLE_BUCKETS } from '@/lib/data'
import type { Bucket, Connection } from '@/lib/types'

type BucketsScreenProps = {
  conn: Connection
  onBrowse: (bucket: Bucket) => void
  onDisconnect: () => void
  onEdit: (conn: Connection) => void
  buckets?: Bucket[]
}

const STATS: { label: string; value: string; icon: React.ReactNode; sub: string }[] = [
  {
    label: 'Buckets',
    value: '3',
    icon: <Package className="size-[18px]" />,
    sub: 'in this connection'
  },
  {
    label: 'Total Storage',
    value: '55.6 GB',
    icon: <HardDrive className="size-[18px]" />,
    sub: 'across all buckets'
  },
  {
    label: 'Total Objects',
    value: '51,908',
    icon: <File className="size-[18px]" />,
    sub: 'across all buckets'
  },
  {
    label: 'Last Active',
    value: '2m ago',
    icon: <Clock className="size-[18px]" />,
    sub: 'production-assets'
  }
]

function filterBuckets(buckets: Bucket[], query: string): Bucket[] {
  const q = query.trim().toLowerCase()
  if (!q) return buckets
  return buckets.filter(
    (b) => b.name.toLowerCase().includes(q) || b.region.toLowerCase().includes(q)
  )
}

export function BucketsScreen({
  conn,
  onBrowse,
  onDisconnect,
  onEdit,
  buckets = SAMPLE_BUCKETS
}: BucketsScreenProps): React.JSX.Element {
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const filteredBuckets = React.useMemo(
    () => filterBuckets(buckets, debouncedSearch),
    [buckets, debouncedSearch]
  )

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 animate-in fade-in">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold tracking-tight">{conn.name}</h1>
            <Badge
              variant="outline"
              className="border-transparent bg-[color:var(--success-soft)] text-[color:var(--success)]"
            >
              <span className="size-1.5 rounded-full bg-[color:var(--success)]" />
              Connected
            </Badge>
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            {conn.endpoint} · IAM: deploy-bot
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="xs" onClick={() => onEdit(conn)}>
            <Settings />
            <span>Edit</span>
          </Button>
          <Button variant="outline" size="xs" onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-2.5">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-lg border bg-card px-4 py-3.5">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {s.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground/70">{s.icon}</span>
              <span className="text-[22px] leading-tight font-semibold tracking-tight">
                {s.value}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">Buckets</span>
        <div className="flex h-[30px] w-[200px] items-center gap-1.5 rounded-md border bg-background px-2 transition-colors focus-within:border-[color:var(--info)] focus-within:shadow-[0_0_0_2px_var(--info-soft)]">
          <Search className="size-3 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buckets…"
            aria-label="Search buckets"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[32px_1fr_120px_90px_80px_120px_110px] gap-1 border-b bg-muted/60 px-3.5 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
          <span />
          <span>Bucket Name</span>
          <span>Region</span>
          <span>Objects</span>
          <span>Size</span>
          <span>Modified</span>
          <span />
        </div>
        {filteredBuckets.length === 0 ? (
          <div className="px-3.5 py-8 text-center text-[12.5px] text-muted-foreground">
            {debouncedSearch.trim() ? (
              <>
                No buckets match{' '}
                <span className="font-medium text-foreground/80">
                  &ldquo;{debouncedSearch.trim()}&rdquo;
                </span>
              </>
            ) : (
              'No buckets in this connection'
            )}
          </div>
        ) : null}
        {filteredBuckets.map((b) => (
          <div
            key={b.name}
            role="button"
            tabIndex={0}
            onClick={() => onBrowse(b)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onBrowse(b)
              }
            }}
            className="grid cursor-pointer grid-cols-[32px_1fr_120px_90px_80px_120px_110px] items-center gap-1 border-b px-3.5 py-3 transition-colors last:border-none hover:bg-muted/60"
          >
            <Package className="size-[15px] text-[color:var(--info)]" />
            <span className="text-[13px] font-medium">{b.name}</span>
            <span className="font-mono text-[11.5px] text-muted-foreground">{b.region}</span>
            <span className="text-[12px] text-muted-foreground">{b.objects}</span>
            <span className="text-[12px] text-muted-foreground">{b.size}</span>
            <span className="text-[12px] text-muted-foreground">{b.modified}</span>
            <div className="flex justify-end">
              <Button variant="outline" size="xs">
                <span>Browse</span>
                <ArrowRight />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 rounded-lg border border-dashed bg-muted/40 px-3.5 py-2.5 text-[12.5px] text-muted-foreground">
        ↳ Click <strong className="text-foreground/70">Browse →</strong> to enter the file explorer
        for that bucket
      </div>
    </div>
  )
}

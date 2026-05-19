import * as React from 'react'
import { ArrowRight, CalendarClock, File, HardDrive, Package, RefreshCw, Search, Settings } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'
import type { Bucket, Connection } from '@/lib/types'

type BucketsScreenProps = {
  conn: Connection
  onBrowse: (bucket: Bucket) => void
  onDisconnect: () => void
  onEdit: (conn: Connection) => void
  onRefresh: () => void
  buckets: Bucket[]
  loading: boolean
  error: string | null
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatCount(n: number, truncated: boolean): string {
  return truncated ? `${n.toLocaleString()}+` : n.toLocaleString()
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  if (diffSecs < 60) return 'just now'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(iso)
}

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
  onRefresh,
  buckets,
  loading,
  error
}: BucketsScreenProps): React.JSX.Element {
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const filteredBuckets = React.useMemo(
    () => filterBuckets(buckets, debouncedSearch),
    [buckets, debouncedSearch]
  )

  const totalObjects = React.useMemo(
    () => buckets.reduce((sum, b) => sum + b.objectCount, 0),
    [buckets]
  )
  const anyTruncated = React.useMemo(() => buckets.some((b) => b.isTruncated), [buckets])
  const totalBytes = React.useMemo(
    () => buckets.reduce((sum, b) => sum + b.totalBytes, 0),
    [buckets]
  )
  const lastModified = React.useMemo(() => {
    const dates = buckets.map((b) => b.lastModified).filter((d): d is string => d !== null)
    if (dates.length === 0) return null
    return dates.reduce((latest, d) => (d > latest ? d : latest))
  }, [buckets])

  const stats = [
    {
      label: 'Buckets',
      value: loading ? null : String(buckets.length),
      icon: <Package className="size-[18px]" />,
      sub: 'in this connection'
    },
    {
      label: 'Total Storage',
      value: loading ? null : formatBytes(totalBytes),
      icon: <HardDrive className="size-[18px]" />,
      sub: anyTruncated ? 'lower bound (>1k objects)' : 'across all buckets'
    },
    {
      label: 'Total Objects',
      value: loading ? null : formatCount(totalObjects, anyTruncated),
      icon: <File className="size-[18px]" />,
      sub: anyTruncated ? 'lower bound (>1k objects)' : 'across all buckets'
    },
    {
      label: 'Last Modified',
      value: loading ? null : formatRelative(lastModified),
      icon: <CalendarClock className="size-[18px]" />,
      sub: conn.lastSeen ? `connected ${conn.lastSeen}` : 'no activity found'
    }
  ]

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 animate-in fade-in">
      {/* Header */}
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
            {conn.endpoint} · {conn.region}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh buckets"
          >
            <RefreshCw className={cn('size-3', loading && 'animate-spin')} />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" size="xs" onClick={() => onEdit(conn)}>
            <Settings />
            <span>Edit</span>
          </Button>
          <Button variant="outline" size="xs" onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-lg border bg-card px-4 py-3.5">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {s.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground/70">{s.icon}</span>
              {s.value === null ? (
                <span className="h-6 w-12 animate-pulse rounded-md bg-muted" />
              ) : (
                <span className="text-[22px] leading-tight font-semibold tracking-tight">
                  {s.value}
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Buckets list */}
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
        {/* Table header */}
        <div className="grid grid-cols-[32px_1fr_140px_90px_110px_130px] gap-1 border-b bg-muted/60 px-3.5 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
          <span />
          <span>Bucket Name</span>
          <span>Region</span>
          <span>Objects</span>
          <span>Size</span>
          <span>Created</span>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="px-3.5 py-6 text-center">
            <p className="text-[12.5px] text-destructive">{error}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-2 text-[12px] text-muted-foreground underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[32px_1fr_140px_90px_110px_130px] items-center gap-1 border-b px-3.5 py-3 last:border-none"
              >
                <span className="size-[15px] animate-pulse rounded bg-muted" />
                <span className="h-4 w-40 animate-pulse rounded bg-muted" />
                <span className="h-3.5 w-20 animate-pulse rounded bg-muted" />
                <span className="h-3.5 w-12 animate-pulse rounded bg-muted" />
                <span className="h-3.5 w-16 animate-pulse rounded bg-muted" />
                <span className="h-3.5 w-14 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && filteredBuckets.length === 0 && (
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
        )}

        {/* Bucket rows */}
        {!loading &&
          !error &&
          filteredBuckets.map((b) => (
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
              className="grid cursor-pointer grid-cols-[32px_1fr_140px_90px_110px_130px] items-center gap-1 border-b px-3.5 py-3 transition-colors last:border-none hover:bg-muted/60"
            >
              <Package className="size-[15px] text-[color:var(--info)]" />
              <span className="text-[13px] font-medium">{b.name}</span>
              <span className="font-mono text-[11.5px] text-muted-foreground">{b.region}</span>
              <span className="text-[12px] text-muted-foreground">
                {formatCount(b.objectCount, b.isTruncated)}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {b.isTruncated ? `${formatBytes(b.totalBytes)}+` : formatBytes(b.totalBytes)}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">{formatDate(b.createdAt)}</span>
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

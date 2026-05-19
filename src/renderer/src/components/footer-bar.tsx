type FooterBarProps = {
  bucket: string
  region: string
  count: number
  usedGb: number
  totalGb: number
}

export function FooterBar({
  bucket,
  region,
  count,
  usedGb,
  totalGb
}: FooterBarProps): React.JSX.Element {
  const pct = Math.min(100, Math.round((usedGb / totalGb) * 100))
  return (
    <div className="flex h-[25px] shrink-0 items-center gap-1.5 border-t bg-muted/50 px-3 text-[11px] text-muted-foreground">
      <span>{bucket}</span>
      <span className="opacity-40">·</span>
      <span>{region}</span>
      <span className="opacity-40">·</span>
      <span>{count} items</span>
      <div className="ml-auto flex items-center gap-1.5">
        <div className="h-[3px] w-16 overflow-hidden rounded-sm bg-border">
          <div className="h-full rounded-sm bg-[color:var(--info)]" style={{ width: `${pct}%` }} />
        </div>
        <span>
          {usedGb} GB / {totalGb} GB
        </span>
      </div>
    </div>
  )
}

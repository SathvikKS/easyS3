import type { S3File } from '@/lib/types'

export type SortField = 'name' | 'size' | 'modified'
export type SortDirection = 'asc' | 'desc'

const SIZE_UNITS: Record<string, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4
}

const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
}

function parseSize(size: string): number {
  if (size === '—') return -1
  const match = size.trim().match(/^([\d.]+)\s*([A-Z]+)$/i)
  if (!match) return 0
  const value = Number.parseFloat(match[1])
  const unit = SIZE_UNITS[match[2].toUpperCase()]
  return unit ? value * unit : 0
}

function parseModified(modified: string): number {
  if (modified === 'just now') return Date.now()
  const match = modified.match(/^([A-Za-z]{3})\s+(\d{1,2})$/)
  if (!match) return 0
  const month = MONTH_INDEX[match[1]]
  if (month === undefined) return 0
  const day = Number.parseInt(match[2], 10)
  return new Date(new Date().getFullYear(), month, day).getTime()
}

export function compareFiles(
  a: S3File,
  b: S3File,
  field: SortField,
  direction: SortDirection
): number {
  let cmp = 0
  switch (field) {
    case 'name':
      cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      break
    case 'size':
      cmp = parseSize(a.size) - parseSize(b.size)
      break
    case 'modified':
      cmp = parseModified(a.modified) - parseModified(b.modified)
      break
  }
  if (cmp === 0) {
    cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  }
  return direction === 'asc' ? cmp : -cmp
}

export function sortFiles(
  files: S3File[],
  field: SortField,
  direction: SortDirection
): S3File[] {
  return [...files].sort((a, b) => compareFiles(a, b, field, direction))
}

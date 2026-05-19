import {
  GetBucketLocationCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client
} from '@aws-sdk/client-s3'

const AWS_DEFAULT_ENDPOINT = 's3.amazonaws.com'

export function createS3Client(
  endpoint: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string
): S3Client {
  const resolvedRegion = region || 'us-east-1'
  const isDefaultEndpoint =
    !endpoint ||
    endpoint === AWS_DEFAULT_ENDPOINT ||
    endpoint.endsWith('.amazonaws.com')

  return new S3Client({
    region: resolvedRegion,
    credentials: { accessKeyId, secretAccessKey },
    ...(isDefaultEndpoint
      ? {}
      : {
          endpoint,
          forcePathStyle: true
        })
  })
}

export async function listBucketCount(client: S3Client): Promise<number> {
  const response = await client.send(new ListBucketsCommand({}))
  return response.Buckets?.length ?? 0
}

export type BucketInfo = {
  name: string
  region: string
  createdAt: string | null
  objectCount: number
  totalBytes: number
  /** True when the bucket has more than 1,000 objects (counts/bytes are a lower-bound sample). */
  isTruncated: boolean
  /** ISO timestamp of the most-recently modified object in the sample, or null if empty. */
  lastModified: string | null
}

async function getBucketStats(
  client: S3Client,
  bucketName: string
): Promise<{ objectCount: number; totalBytes: number; isTruncated: boolean; lastModified: string | null }> {
  const response = await client.send(
    new ListObjectsV2Command({ Bucket: bucketName, MaxKeys: 1000 })
  )

  let objectCount = 0
  let totalBytes = 0
  let lastModified: Date | null = null

  for (const obj of response.Contents ?? []) {
    objectCount++
    totalBytes += obj.Size ?? 0
    if (obj.LastModified && (!lastModified || obj.LastModified > lastModified)) {
      lastModified = obj.LastModified
    }
  }

  return {
    objectCount,
    totalBytes,
    isTruncated: response.IsTruncated ?? false,
    lastModified: lastModified?.toISOString() ?? null
  }
}

export type S3FileType = 'folder' | 'image' | 'audio' | 'video' | 'text' | 'data' | 'other'

export type FileEntry = {
  name: string
  type: S3FileType
  size: string
  modified: string
  mime: string
}

export type ListFilesResult = {
  files: FileEntry[]
  nextContinuationToken?: string
  isTruncated: boolean
  keyCount: number
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    pdf: 'application/pdf',
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    md: 'text/markdown',
    txt: 'text/plain',
    js: 'text/javascript',
    ts: 'text/typescript',
    jsx: 'text/jsx',
    tsx: 'text/tsx',
    html: 'text/html',
    css: 'text/css',
    zip: 'application/zip',
    gz: 'application/gzip',
    tar: 'application/x-tar'
  }
  return map[ext] ?? 'application/octet-stream'
}

function getFileType(mime: string): S3FileType {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (
    mime === 'text/csv' ||
    mime.includes('spreadsheet') ||
    mime.includes('excel')
  )
    return 'data'
  if (
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    mime === 'application/xml' ||
    mime === 'application/pdf'
  )
    return 'text'
  return 'other'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatModified(date: Date | undefined): string {
  if (!date) return '—'
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export async function listFiles(
  client: S3Client,
  bucket: string,
  prefix: string,
  continuationToken?: string,
  maxKeys = 100
): Promise<ListFilesResult> {
  const resolvedPrefix = prefix || undefined
  const clampedMaxKeys = Math.min(maxKeys, 1000)

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: resolvedPrefix,
      Delimiter: '/',
      MaxKeys: clampedMaxKeys,
      ...(continuationToken ? { ContinuationToken: continuationToken } : {})
    })
  )

  const folders: FileEntry[] = (response.CommonPrefixes ?? []).map((cp) => {
    const fullPrefix = cp.Prefix ?? ''
    const relative = fullPrefix.slice(prefix.length)
    const name = relative.endsWith('/') ? relative.slice(0, -1) : relative
    return {
      name,
      type: 'folder',
      size: '—',
      modified: '—',
      mime: 'folder'
    }
  })

  const files: FileEntry[] = (response.Contents ?? [])
    .filter((obj) => obj.Key !== prefix)
    .map((obj) => {
      const key = obj.Key ?? ''
      const name = key.slice(prefix.length)
      const mime = getMimeType(name)
      return {
        name,
        type: getFileType(mime),
        size: obj.Size !== undefined ? formatFileSize(obj.Size) : '—',
        modified: formatModified(obj.LastModified),
        mime
      }
    })

  return {
    files: [...folders, ...files],
    nextContinuationToken: response.NextContinuationToken,
    isTruncated: response.IsTruncated ?? false,
    keyCount: response.KeyCount ?? 0
  }
}

export async function listBuckets(client: S3Client, defaultRegion: string): Promise<BucketInfo[]> {
  const response = await client.send(new ListBucketsCommand({}))
  const buckets = response.Buckets ?? []

  const results = await Promise.allSettled(
    buckets.map(async (b) => {
      let region = defaultRegion
      try {
        const loc = await client.send(new GetBucketLocationCommand({ Bucket: b.Name! }))
        region = loc.LocationConstraint ?? 'us-east-1'
      } catch {
        // permission denied or unsupported — fall back to connection default
      }

      const stats = await getBucketStats(client, b.Name!)

      return {
        name: b.Name!,
        region,
        createdAt: b.CreationDate?.toISOString() ?? null,
        ...stats
      } satisfies BucketInfo
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<BucketInfo> => r.status === 'fulfilled')
    .map((r) => r.value)
}

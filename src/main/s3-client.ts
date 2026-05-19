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

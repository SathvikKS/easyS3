import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3'

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

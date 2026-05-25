import { ipcMain } from 'electron'

import { IPC } from '../../shared/ipc'
import { decryptCredential } from '../credentials'
import { getConnectionById, getCredentials } from '../connections-store'
import { assertTrustedSender } from '../ipc-guards'
import { getSetting } from '../store'
import { createS3Client, getBucketInfo, listBuckets } from '../s3-client'

function parseId(id: unknown): string {
  if (typeof id !== 'string' || !id) throw new Error('Invalid connection id')
  return id
}

export function registerBucketIpcHandlers(): void {
  ipcMain.handle(IPC.buckets.list, async (event, id: unknown) => {
    assertTrustedSender(event)
    const connId = parseId(id)
    const conn = getConnectionById(connId)
    if (!conn) throw new Error(`Connection not found: ${connId}`)

    const rawCreds = getCredentials(conn.credentialKey)
    const client = createS3Client(
      conn.endpoint,
      conn.region,
      decryptCredential(rawCreds.key),
      decryptCredential(rawCreds.secret)
    )

    const fetchStats = getSetting('fetchBucketStats')
    try {
      return await listBuckets(client, conn.region, fetchStats)
    } catch {
      // Provider doesn't allow listing all buckets (e.g. GCP bucket-scoped HMAC).
      // Fall back to returning info for the single configured bucket.
      if (conn.bucket) {
        return [await getBucketInfo(client, conn.bucket, conn.region, fetchStats)]
      }
      throw new Error('Access denied: cannot list buckets and no specific bucket is configured')
    }
  })
}

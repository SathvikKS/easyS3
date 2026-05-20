import { ipcMain } from 'electron'

import { IPC } from '../../shared/ipc'
import { decryptCredential } from '../credentials'
import { getConnectionById, getCredentials } from '../connections-store'
import { assertTrustedSender } from '../ipc-guards'
import { getSetting } from '../store'
import { createS3Client, listBuckets } from '../s3-client'

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
    return listBuckets(client, conn.region, fetchStats)
  })
}

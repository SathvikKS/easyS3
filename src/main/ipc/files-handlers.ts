import { ipcMain } from 'electron'

import { IPC } from '../../shared/ipc'
import { decryptCredential } from '../credentials'
import { getConnectionById, getCredentials } from '../connections-store'
import { assertTrustedSender } from '../ipc-guards'
import { createS3Client, listFiles } from '../s3-client'

type ListFilesArgs = {
  connId: string
  bucket: string
  prefix: string
  continuationToken?: string
  maxKeys?: number
}

function parseListFilesArgs(args: unknown): ListFilesArgs {
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments: expected an object')
  }
  const a = args as Record<string, unknown>

  if (typeof a.connId !== 'string' || !a.connId) {
    throw new Error('Invalid arguments: connId must be a non-empty string')
  }
  if (typeof a.bucket !== 'string' || !a.bucket) {
    throw new Error('Invalid arguments: bucket must be a non-empty string')
  }
  if (typeof a.prefix !== 'string') {
    throw new Error('Invalid arguments: prefix must be a string')
  }
  if (a.continuationToken !== undefined && typeof a.continuationToken !== 'string') {
    throw new Error('Invalid arguments: continuationToken must be a string if provided')
  }
  if (a.maxKeys !== undefined) {
    if (typeof a.maxKeys !== 'number' || a.maxKeys <= 0) {
      throw new Error('Invalid arguments: maxKeys must be a positive number if provided')
    }
  }

  return {
    connId: a.connId,
    bucket: a.bucket,
    prefix: a.prefix,
    continuationToken: a.continuationToken as string | undefined,
    maxKeys: a.maxKeys !== undefined ? Math.min(a.maxKeys as number, 1000) : undefined
  }
}

export function registerFilesIpcHandlers(): void {
  ipcMain.handle(IPC.files.list, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, prefix, continuationToken, maxKeys } = parseListFilesArgs(args)

    const conn = getConnectionById(connId)
    if (!conn) throw new Error(`Connection not found: ${connId}`)

    const rawCreds = getCredentials(conn.credentialKey)
    const client = createS3Client(
      conn.endpoint,
      conn.region,
      decryptCredential(rawCreds.key),
      decryptCredential(rawCreds.secret)
    )

    return listFiles(client, bucket, prefix, continuationToken, maxKeys)
  })
}

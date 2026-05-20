import { ipcMain } from 'electron'

import { IPC } from '../../shared/ipc'
import { decryptCredential } from '../credentials'
import { getConnectionById, getCredentials } from '../connections-store'
import { assertTrustedSender } from '../ipc-guards'
import {
  createS3Client,
  deleteObject,
  downloadFile,
  getFilePreview,
  getPresignedUrl,
  listFiles
} from '../s3-client'

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

type FileOpArgs = {
  connId: string
  bucket: string
  key: string
}

function parseFileOpArgs(args: unknown): FileOpArgs {
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
  if (typeof a.key !== 'string' || !a.key) {
    throw new Error('Invalid arguments: key must be a non-empty string')
  }
  return { connId: a.connId, bucket: a.bucket, key: a.key }
}

function getClientForConn(connId: string): ReturnType<typeof createS3Client> {
  const conn = getConnectionById(connId)
  if (!conn) throw new Error(`Connection not found: ${connId}`)
  const rawCreds = getCredentials(conn.credentialKey)
  return createS3Client(
    conn.endpoint,
    conn.region,
    decryptCredential(rawCreds.key),
    decryptCredential(rawCreds.secret)
  )
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

  ipcMain.handle(IPC.files.download, async (event, args: unknown) => {
    assertTrustedSender(event)
    const base = parseFileOpArgs(args)
    const a = args as Record<string, unknown>
    if (typeof a.destPath !== 'string' || !a.destPath) {
      throw new Error('Invalid arguments: destPath must be a non-empty string')
    }
    try {
      const client = getClientForConn(base.connId)
      await downloadFile(client, base.bucket, base.key, a.destPath)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(IPC.files.delete, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, key } = parseFileOpArgs(args)
    try {
      const client = getClientForConn(connId)
      await deleteObject(client, bucket, key)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(IPC.files.getPresignedUrl, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, key } = parseFileOpArgs(args)
    const a = args as Record<string, unknown>
    if (a.expiresIn !== undefined && (typeof a.expiresIn !== 'number' || a.expiresIn <= 0)) {
      throw new Error('Invalid arguments: expiresIn must be a positive number if provided')
    }
    const expiresIn = typeof a.expiresIn === 'number' ? a.expiresIn : undefined
    const client = getClientForConn(connId)
    const url = await getPresignedUrl(client, bucket, key, expiresIn)
    return { url }
  })

  ipcMain.handle(IPC.files.getS3Url, (event, args: unknown) => {
    assertTrustedSender(event)
    const { bucket, key } = parseFileOpArgs(args)
    return { url: `s3://${bucket}/${key}` }
  })

  ipcMain.handle(IPC.files.getPreview, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, key } = parseFileOpArgs(args)
    const a = args as Record<string, unknown>
    if (typeof a.fileType !== 'string') {
      throw new Error('Invalid arguments: fileType must be a string')
    }
    const client = getClientForConn(connId)
    return getFilePreview(client, bucket, key, a.fileType)
  })
}

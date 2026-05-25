import { ipcMain } from 'electron'

import { IPC } from '../../shared/ipc'
import { decryptCredential, encryptCredential } from '../credentials'
import {
  addConnection,
  deleteConnection,
  getAllConnections,
  getConnectionById,
  getCredentials,
  setLastSeen,
  updateConnection
} from '../connections-store'
import type { StoredConnection } from '../connections-store'
import { assertTrustedSender } from '../ipc-guards'
import { checkBucketAccess, createS3Client, listBucketCount } from '../s3-client'

type Connection = {
  id: string
  name: string
  endpoint: string
  region: string
  bucket: string
  status: 'connected' | 'disconnected'
  lastSeen: string | null
  buckets: number | null
}

type ConnectionFormValues = {
  name: string
  endpoint: string
  key: string
  secret: string
  bucket: string
  region: string
}

type ConnectResult = {
  success: boolean
  buckets: number | null
  lastSeen: string | null
  error?: string
}

function formatLastSeen(iso: string | null): string | null {
  if (!iso) return null
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  if (diffSecs < 60) return 'just now'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function toConnection(stored: StoredConnection): Connection {
  return {
    id: stored.id,
    name: stored.name,
    endpoint: stored.endpoint,
    region: stored.region,
    bucket: stored.bucket,
    status: 'disconnected',
    lastSeen: formatLastSeen(stored.lastSeen),
    buckets: null
  }
}

function parseFormValues(values: unknown): ConnectionFormValues {
  if (
    !values ||
    typeof values !== 'object' ||
    typeof (values as Record<string, unknown>).name !== 'string' ||
    typeof (values as Record<string, unknown>).endpoint !== 'string' ||
    typeof (values as Record<string, unknown>).key !== 'string' ||
    typeof (values as Record<string, unknown>).secret !== 'string' ||
    typeof (values as Record<string, unknown>).bucket !== 'string' ||
    typeof (values as Record<string, unknown>).region !== 'string'
  ) {
    throw new Error('Invalid connection form values')
  }
  const v = values as ConnectionFormValues
  return { name: v.name, endpoint: v.endpoint, key: v.key, secret: v.secret, bucket: v.bucket, region: v.region }
}

function parseId(id: unknown): string {
  if (typeof id !== 'string' || !id) throw new Error('Invalid connection id')
  return id
}

export function registerConnectionIpcHandlers(): void {
  ipcMain.handle(IPC.connections.getAll, (event) => {
    assertTrustedSender(event)
    return getAllConnections().map(toConnection)
  })

  ipcMain.handle(IPC.connections.add, async (event, values: unknown) => {
    assertTrustedSender(event)
    const form = parseFormValues(values)
    const id = crypto.randomUUID()
    const credentialKey = `cred_${id}`
    const stored: StoredConnection = {
      id,
      name: form.name,
      endpoint: form.endpoint,
      region: form.region,
      bucket: form.bucket,
      credentialKey,
      lastSeen: null
    }
    addConnection(stored, {
      key: encryptCredential(form.key),
      secret: encryptCredential(form.secret)
    })

    const iso = new Date().toISOString()
    try {
      const rawCreds = getCredentials(credentialKey)
      const client = createS3Client(
        form.endpoint,
        form.region,
        decryptCredential(rawCreds.key),
        decryptCredential(rawCreds.secret)
      )
      await listBucketCount(client)
      setLastSeen(id, iso)
    } catch {
      // auto-connect failure is non-fatal on add
    }

    const latest = getAllConnections().find((c) => c.id === id)!
    return toConnection(latest)
  })

  ipcMain.handle(IPC.connections.update, async (event, id: unknown, values: unknown) => {
    assertTrustedSender(event)
    const connId = parseId(id)
    const form = parseFormValues(values)
    const existing = getConnectionById(connId)
    if (!existing) throw new Error(`Connection not found: ${connId}`)

    const patch: Partial<StoredConnection> = {
      name: form.name,
      endpoint: form.endpoint,
      region: form.region,
      bucket: form.bucket
    }
    const newCreds =
      form.key && form.secret
        ? {
            key: encryptCredential(form.key),
            secret: encryptCredential(form.secret)
          }
        : undefined

    const updated = updateConnection(connId, patch, newCreds)
    return toConnection(updated)
  })

  ipcMain.handle(IPC.connections.delete, (event, id: unknown) => {
    assertTrustedSender(event)
    deleteConnection(parseId(id))
  })

  ipcMain.handle(IPC.connections.duplicate, (event, id: unknown) => {
    assertTrustedSender(event)
    const connId = parseId(id)
    const original = getConnectionById(connId)
    if (!original) throw new Error(`Connection not found: ${connId}`)

    const newId = crypto.randomUUID()
    const newCredentialKey = `cred_${newId}`
    const originalCreds = getCredentials(original.credentialKey)
    const copy: StoredConnection = {
      ...original,
      id: newId,
      name: `Copy of ${original.name}`,
      credentialKey: newCredentialKey,
      lastSeen: null
    }
    addConnection(copy, originalCreds)
    return toConnection(copy)
  })

  ipcMain.handle(IPC.connections.connect, async (event, id: unknown) => {
    assertTrustedSender(event)
    const connId = parseId(id)
    const conn = getConnectionById(connId)
    if (!conn) return { success: false, buckets: null, lastSeen: null, error: 'Connection not found' } satisfies ConnectResult

    try {
      const rawCreds = getCredentials(conn.credentialKey)
      const client = createS3Client(
        conn.endpoint,
        conn.region,
        decryptCredential(rawCreds.key),
        decryptCredential(rawCreds.secret)
      )

      let buckets: number | null = null
      try {
        buckets = await listBucketCount(client)
      } catch {
        // Provider may not allow listing all buckets (e.g. GCP bucket-scoped HMAC).
        // Verify access to the specific configured bucket instead.
        if (conn.bucket) {
          await checkBucketAccess(client, conn.bucket)
        } else {
          throw new Error('Access denied and no specific bucket configured')
        }
      }

      const iso = new Date().toISOString()
      setLastSeen(connId, iso)
      return { success: true, buckets, lastSeen: formatLastSeen(iso) } satisfies ConnectResult
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      return { success: false, buckets: null, lastSeen: null, error } satisfies ConnectResult
    }
  })

  ipcMain.handle(IPC.connections.testConnect, async (event, values: unknown) => {
    assertTrustedSender(event)
    const form = parseFormValues(values)
    try {
      const client = createS3Client(form.endpoint, form.region, form.key, form.secret)
      const buckets = await listBucketCount(client)
      const lastSeen = formatLastSeen(new Date().toISOString())
      return { success: true, buckets, lastSeen } satisfies ConnectResult
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      return { success: false, buckets: null, lastSeen: null, error } satisfies ConnectResult
    }
  })
}

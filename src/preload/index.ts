import { contextBridge, ipcRenderer } from 'electron'

import { IPC } from '../shared/ipc'
import type { AppSettings } from '../shared/settings'
import { isAppSettingKey, isValidSettingValue } from '../shared/settings-validation'

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

type BucketInfo = {
  name: string
  region: string
  createdAt: string | null
  objectCount: number
  totalBytes: number
  isTruncated: boolean
  lastModified: string | null
}

/**
 * Narrow IPC surface: only whitelisted channels and validated arguments cross the bridge.
 * Never expose ipcRenderer, Node, or process to the renderer.
 */
const settings = {
  getAllSync: (): AppSettings =>
    ipcRenderer.sendSync(IPC.settings.getAllSync) as AppSettings,

  getAll: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.settings.getAll),

  get: <K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> => {
    if (!isAppSettingKey(key)) {
      return Promise.reject(new Error('Invalid settings key'))
    }
    return ipcRenderer.invoke(IPC.settings.get, key)
  },

  set: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<AppSettings[K]> => {
    if (!isAppSettingKey(key) || !isValidSettingValue(key, value)) {
      return Promise.reject(new Error('Invalid settings key or value'))
    }
    return ipcRenderer.invoke(IPC.settings.set, key, value)
  },

  selectDownloadDirectory: (currentPath?: string): Promise<string | null> => {
    if (currentPath !== undefined && typeof currentPath !== 'string') {
      return Promise.reject(new Error('Invalid download directory path'))
    }
    return ipcRenderer.invoke(IPC.settings.selectDownloadDirectory, currentPath)
  }
}

function assertId(id: unknown): asserts id is string {
  if (typeof id !== 'string' || !id) throw new Error('Invalid connection id')
}

function assertFormValues(values: unknown): asserts values is ConnectionFormValues {
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
}

const connections = {
  getAll: (): Promise<Connection[]> => ipcRenderer.invoke(IPC.connections.getAll),

  add: (values: ConnectionFormValues): Promise<Connection> => {
    assertFormValues(values)
    return ipcRenderer.invoke(IPC.connections.add, values)
  },

  update: (id: string, values: ConnectionFormValues): Promise<Connection> => {
    assertId(id)
    assertFormValues(values)
    return ipcRenderer.invoke(IPC.connections.update, id, values)
  },

  delete: (id: string): Promise<void> => {
    assertId(id)
    return ipcRenderer.invoke(IPC.connections.delete, id)
  },

  duplicate: (id: string): Promise<Connection> => {
    assertId(id)
    return ipcRenderer.invoke(IPC.connections.duplicate, id)
  },

  connect: (id: string): Promise<ConnectResult> => {
    assertId(id)
    return ipcRenderer.invoke(IPC.connections.connect, id)
  },

  testConnect: (values: ConnectionFormValues): Promise<ConnectResult> => {
    assertFormValues(values)
    return ipcRenderer.invoke(IPC.connections.testConnect, values)
  }
}

const buckets = {
  list: (id: string): Promise<BucketInfo[]> => {
    assertId(id)
    return ipcRenderer.invoke(IPC.buckets.list, id)
  }
}

const api = { settings, connections, buckets }

if (!process.contextIsolated) {
  throw new Error(
    'contextIsolation must be enabled. Refusing to expose APIs on an insecure renderer.'
  )
}

contextBridge.exposeInMainWorld('api', api)

export type EasyS3Settings = typeof settings
export type EasyS3Connections = typeof connections
export type EasyS3Buckets = typeof buckets
export type EasyS3Api = typeof api

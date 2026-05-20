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

type S3FileType = 'folder' | 'image' | 'audio' | 'video' | 'text' | 'data' | 'other'

type FileEntry = {
  name: string
  type: S3FileType
  size: string
  modified: string
  mime: string
}

type ListFilesRequest = {
  connId: string
  bucket: string
  prefix: string
  continuationToken?: string
  maxKeys?: number
}

type ListFilesResult = {
  files: FileEntry[]
  nextContinuationToken?: string
  isTruncated: boolean
  keyCount: number
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

type PreviewResult =
  | { type: 'url'; url: string }
  | { type: 'text'; content: string }
  | { type: 'none' }

type DownloadItem = { key: string; name: string }
type DownloadJobRequest = { connId: string; bucket: string; files: DownloadItem[] }
type DeleteRequest = { connId: string; bucket: string; keys: string[] }
type UploadRequest = { connId: string; bucket: string; destPrefix: string }
type CreateFolderRequest = { connId: string; bucket: string; key: string }
type PresignedUrlRequest = { connId: string; bucket: string; key: string; expiresIn?: number }
type S3UrlRequest = { connId: string; bucket: string; key: string }
type PreviewRequest = { connId: string; bucket: string; key: string; fileType: string }

function assertListFilesRequest(req: unknown): asserts req is ListFilesRequest {
  if (
    !req ||
    typeof req !== 'object' ||
    typeof (req as Record<string, unknown>).connId !== 'string' ||
    !(req as Record<string, unknown>).connId ||
    typeof (req as Record<string, unknown>).bucket !== 'string' ||
    !(req as Record<string, unknown>).bucket ||
    typeof (req as Record<string, unknown>).prefix !== 'string'
  ) {
    throw new Error('Invalid list files request')
  }
  const r = req as Record<string, unknown>
  if (r.continuationToken !== undefined && typeof r.continuationToken !== 'string') {
    throw new Error('Invalid list files request: continuationToken must be a string')
  }
  if (r.maxKeys !== undefined && typeof r.maxKeys !== 'number') {
    throw new Error('Invalid list files request: maxKeys must be a number')
  }
}

function assertFileOpBase(
  req: unknown
): asserts req is { connId: string; bucket: string; key: string } {
  if (
    !req ||
    typeof req !== 'object' ||
    typeof (req as Record<string, unknown>).connId !== 'string' ||
    !(req as Record<string, unknown>).connId ||
    typeof (req as Record<string, unknown>).bucket !== 'string' ||
    !(req as Record<string, unknown>).bucket ||
    typeof (req as Record<string, unknown>).key !== 'string' ||
    !(req as Record<string, unknown>).key
  ) {
    throw new Error('Invalid file operation request')
  }
}

function assertDeleteRequest(req: unknown): asserts req is DeleteRequest {
  if (!req || typeof req !== 'object') throw new Error('Invalid delete request')
  const r = req as Record<string, unknown>
  if (typeof r.connId !== 'string' || !r.connId) throw new Error('Invalid delete request: connId must be a non-empty string')
  if (typeof r.bucket !== 'string' || !r.bucket) throw new Error('Invalid delete request: bucket must be a non-empty string')
  if (!Array.isArray(r.keys) || r.keys.length === 0) throw new Error('Invalid delete request: keys must be a non-empty array')
  for (const k of r.keys as unknown[]) {
    if (typeof k !== 'string' || !k) throw new Error('Invalid delete request: each key must be a non-empty string')
  }
}

function assertUploadRequest(req: unknown): asserts req is UploadRequest {
  if (!req || typeof req !== 'object') throw new Error('Invalid upload request')
  const r = req as Record<string, unknown>
  if (typeof r.connId !== 'string' || !r.connId) throw new Error('Invalid upload request: connId must be a non-empty string')
  if (typeof r.bucket !== 'string' || !r.bucket) throw new Error('Invalid upload request: bucket must be a non-empty string')
  if (typeof r.destPrefix !== 'string') throw new Error('Invalid upload request: destPrefix must be a string')
}

function assertCreateFolderRequest(req: unknown): asserts req is CreateFolderRequest {
  if (!req || typeof req !== 'object') throw new Error('Invalid create folder request')
  const r = req as Record<string, unknown>
  if (typeof r.connId !== 'string' || !r.connId) throw new Error('Invalid create folder request: connId must be a non-empty string')
  if (typeof r.bucket !== 'string' || !r.bucket) throw new Error('Invalid create folder request: bucket must be a non-empty string')
  if (typeof r.key !== 'string' || !r.key) throw new Error('Invalid create folder request: key must be a non-empty string')
}

function assertDownloadJobRequest(req: unknown): asserts req is DownloadJobRequest {
  if (
    !req ||
    typeof req !== 'object' ||
    typeof (req as Record<string, unknown>).connId !== 'string' ||
    !(req as Record<string, unknown>).connId ||
    typeof (req as Record<string, unknown>).bucket !== 'string' ||
    !(req as Record<string, unknown>).bucket
  ) {
    throw new Error('Invalid download job request')
  }
  const r = req as Record<string, unknown>
  if (!Array.isArray(r.files) || r.files.length === 0) {
    throw new Error('Invalid download job request: files must be a non-empty array')
  }
  for (const item of r.files as unknown[]) {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof (item as Record<string, unknown>).key !== 'string' ||
      !(item as Record<string, unknown>).key ||
      typeof (item as Record<string, unknown>).name !== 'string' ||
      !(item as Record<string, unknown>).name
    ) {
      throw new Error('Invalid download job request: each file must have a non-empty key and name')
    }
  }
}

const files = {
  list: (req: ListFilesRequest): Promise<ListFilesResult> => {
    assertListFilesRequest(req)
    return ipcRenderer.invoke(IPC.files.list, req)
  },

  download: (req: DownloadJobRequest): Promise<{ success: boolean; cancelled?: boolean; error?: string }> => {
    assertDownloadJobRequest(req)
    return ipcRenderer.invoke(IPC.files.download, req)
  },

  delete: (req: DeleteRequest): Promise<{ success: boolean; deleted: number; error?: string }> => {
    assertDeleteRequest(req)
    return ipcRenderer.invoke(IPC.files.delete, req)
  },

  upload: (req: UploadRequest): Promise<{ success: boolean; cancelled?: boolean; uploaded: number; error?: string }> => {
    assertUploadRequest(req)
    return ipcRenderer.invoke(IPC.files.upload, req)
  },

  uploadFolder: (req: UploadRequest): Promise<{ success: boolean; cancelled?: boolean; uploaded: number; error?: string }> => {
    assertUploadRequest(req)
    return ipcRenderer.invoke(IPC.files.uploadFolder, req)
  },

  createFolder: (req: CreateFolderRequest): Promise<{ success: boolean; error?: string }> => {
    assertCreateFolderRequest(req)
    return ipcRenderer.invoke(IPC.files.createFolder, req)
  },

  getPresignedUrl: (req: PresignedUrlRequest): Promise<{ url: string }> => {
    assertFileOpBase(req)
    if (req.expiresIn !== undefined && (typeof req.expiresIn !== 'number' || req.expiresIn <= 0)) {
      return Promise.reject(
        new Error('Invalid presigned URL request: expiresIn must be a positive number')
      )
    }
    return ipcRenderer.invoke(IPC.files.getPresignedUrl, req)
  },

  getS3Url: (req: S3UrlRequest): Promise<{ url: string }> => {
    assertFileOpBase(req)
    return ipcRenderer.invoke(IPC.files.getS3Url, req)
  },

  getPreview: (req: PreviewRequest): Promise<PreviewResult> => {
    assertFileOpBase(req)
    if (typeof req.fileType !== 'string') {
      return Promise.reject(new Error('Invalid preview request: fileType must be a string'))
    }
    return ipcRenderer.invoke(IPC.files.getPreview, req)
  }
}

const api = { settings, connections, buckets, files }

if (!process.contextIsolated) {
  throw new Error(
    'contextIsolation must be enabled. Refusing to expose APIs on an insecure renderer.'
  )
}

contextBridge.exposeInMainWorld('api', api)

export type EasyS3Settings = typeof settings
export type EasyS3Connections = typeof connections
export type EasyS3Buckets = typeof buckets
export type EasyS3Files = typeof files
export type EasyS3Api = typeof api
export type EasyS3PreviewResult = PreviewResult

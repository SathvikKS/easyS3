import type { AppSettings, ThemeMode } from '../shared/settings'

export type { AppSettings, ThemeMode }

export type Connection = {
  id: string
  name: string
  endpoint: string
  region: string
  bucket: string
  status: 'connected' | 'disconnected'
  lastSeen: string | null
  buckets: number | null
}

export type ConnectionFormValues = {
  name: string
  endpoint: string
  key: string
  secret: string
  bucket: string
  region: string
}

export type ConnectResult = {
  success: boolean
  buckets: number | null
  lastSeen: string | null
  error?: string
}

export type BucketInfo = {
  name: string
  region: string
  createdAt: string | null
  objectCount: number
  totalBytes: number
  isTruncated: boolean
  lastModified: string | null
}

export type S3FileType = 'folder' | 'image' | 'audio' | 'video' | 'text' | 'data' | 'other'

export type FileEntry = {
  name: string
  type: S3FileType
  size: string
  modified: string
  mime: string
}

export type ListFilesRequest = {
  connId: string
  bucket: string
  prefix: string
  continuationToken?: string
  maxKeys?: number
}

export type ListFilesResult = {
  files: FileEntry[]
  nextContinuationToken?: string
  isTruncated: boolean
  keyCount: number
}

export interface EasyS3Settings {
  getAllSync: () => AppSettings
  getAll: () => Promise<AppSettings>
  get: <K extends keyof AppSettings>(key: K) => Promise<AppSettings[K]>
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<AppSettings[K]>
  selectDownloadDirectory: (currentPath?: string) => Promise<string | null>
}

export interface EasyS3Connections {
  getAll: () => Promise<Connection[]>
  add: (values: ConnectionFormValues) => Promise<Connection>
  update: (id: string, values: ConnectionFormValues) => Promise<Connection>
  delete: (id: string) => Promise<void>
  duplicate: (id: string) => Promise<Connection>
  connect: (id: string) => Promise<ConnectResult>
  testConnect: (values: ConnectionFormValues) => Promise<ConnectResult>
}

export interface EasyS3Buckets {
  list: (id: string) => Promise<BucketInfo[]>
}

export type PreviewResult =
  | { type: 'url'; url: string }
  | { type: 'text'; content: string }
  | { type: 'none' }

export type DownloadFileRequest = { connId: string; bucket: string; key: string; destPath: string }
export type DeleteFileRequest = { connId: string; bucket: string; key: string }
export type PresignedUrlRequest = { connId: string; bucket: string; key: string; expiresIn?: number }
export type S3UrlRequest = { connId: string; bucket: string; key: string }
export type PreviewRequest = { connId: string; bucket: string; key: string; fileType: string }

export interface EasyS3Files {
  list: (req: ListFilesRequest) => Promise<ListFilesResult>
  download: (req: DownloadFileRequest) => Promise<{ success: boolean; error?: string }>
  delete: (req: DeleteFileRequest) => Promise<{ success: boolean; error?: string }>
  getPresignedUrl: (req: PresignedUrlRequest) => Promise<{ url: string }>
  getS3Url: (req: S3UrlRequest) => Promise<{ url: string }>
  getPreview: (req: PreviewRequest) => Promise<PreviewResult>
}

export interface EasyS3Api {
  settings: EasyS3Settings
  connections: EasyS3Connections
  buckets: EasyS3Buckets
  files: EasyS3Files
}

declare global {
  interface Window {
    api: EasyS3Api
  }
}

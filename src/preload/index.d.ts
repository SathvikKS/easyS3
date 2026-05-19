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

export interface EasyS3Api {
  settings: EasyS3Settings
  connections: EasyS3Connections
  buckets: EasyS3Buckets
}

declare global {
  interface Window {
    api: EasyS3Api
  }
}

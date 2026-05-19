export type ConnectionStatus = 'connected' | 'disconnected'

export type Connection = {
  name: string
  endpoint: string
  status: ConnectionStatus
  lastSeen: string
  buckets: number | null
  /** Optional credentials, persisted only for the lifetime of the UI mock. */
  key?: string
  secret?: string
  bucket?: string
  region?: string
}

export type Bucket = {
  name: string
  region: string
  objects: string
  size: string
  modified: string
}

export type S3FileType = 'folder' | 'image' | 'audio' | 'video' | 'text' | 'data' | 'other'

export type S3File = {
  name: string
  type: S3FileType
  size: string
  modified: string
  mime: string
}

export type LayoutMode = 'list' | 'grid'

export type Screen = 'connections' | 'buckets' | 'explorer'

export type ConnectionFormValues = {
  name: string
  endpoint: string
  key: string
  secret: string
  bucket: string
  region: string
}

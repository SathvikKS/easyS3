export type ConnectionStatus = 'connected' | 'disconnected'

export type Connection = {
  id: string
  name: string
  endpoint: string
  region: string
  bucket: string
  status: ConnectionStatus
  lastSeen: string | null
  buckets: number | null
}

export type ConnectResult = {
  success: boolean
  buckets: number | null
  lastSeen: string | null
  error?: string
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

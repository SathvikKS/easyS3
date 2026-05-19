import type { Bucket, Connection, S3File } from './types'

export const SAMPLE_CONNECTIONS: Connection[] = [
  {
    name: 'my-production',
    endpoint: 's3.amazonaws.com',
    status: 'connected',
    lastSeen: '2m ago',
    buckets: 3,
    region: 'us-east-1'
  },
  {
    name: 'staging',
    endpoint: 'minio.company.internal',
    status: 'connected',
    lastSeen: '1h ago',
    buckets: 5,
    region: 'us-east-1'
  },
  {
    name: 'local-dev',
    endpoint: 'localhost:9000',
    status: 'disconnected',
    lastSeen: 'Jan 20',
    buckets: null,
    region: 'us-east-1'
  }
]

export const SAMPLE_BUCKETS: Bucket[] = [
  {
    name: 'production-assets',
    region: 'us-east-1',
    objects: '456',
    size: '2.1 GB',
    modified: 'Jan 22'
  },
  {
    name: 'user-uploads',
    region: 'us-east-1',
    objects: '1,234',
    size: '8.3 GB',
    modified: 'Jan 21'
  },
  {
    name: 'logs-archive',
    region: 'eu-west-1',
    objects: '50,218',
    size: '45.2 GB',
    modified: 'Jan 20'
  }
]

export const SAMPLE_FILES: S3File[] = [
  { name: 'images', type: 'folder', size: '—', modified: 'Jan 15', mime: 'folder' },
  { name: 'videos', type: 'folder', size: '—', modified: 'Jan 10', mime: 'folder' },
  { name: 'README.md', type: 'text', size: '2.3 KB', modified: 'Jan 20', mime: 'text/markdown' },
  {
    name: 'config.json',
    type: 'text',
    size: '1.1 KB',
    modified: 'Jan 18',
    mime: 'application/json'
  },
  { name: 'banner.png', type: 'image', size: '450 KB', modified: 'Jan 22', mime: 'image/png' },
  { name: 'styles.css', type: 'text', size: '8.2 KB', modified: 'Jan 19', mime: 'text/css' },
  { name: 'intro.mp3', type: 'audio', size: '2.1 MB', modified: 'Jan 12', mime: 'audio/mpeg' },
  { name: 'data.csv', type: 'data', size: '15.4 KB', modified: 'Jan 17', mime: 'text/csv' }
]

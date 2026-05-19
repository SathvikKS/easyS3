import Store, { type Schema } from 'electron-store'

export type StoredConnection = {
  id: string
  name: string
  endpoint: string
  region: string
  bucket: string
  credentialKey: string
  lastSeen: string | null
}

export type CredentialPair = {
  key: string
  secret: string
}

type ConnectionsData = {
  connections: StoredConnection[]
  credentials: Record<string, CredentialPair>
}

let storeInstance: Store<ConnectionsData> | null = null

export function getConnectionsStore(): Store<ConnectionsData> {
  if (storeInstance) return storeInstance

  const schema: Schema<ConnectionsData> = {
    connections: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          endpoint: { type: 'string' },
          region: { type: 'string' },
          bucket: { type: 'string' },
          credentialKey: { type: 'string' },
          lastSeen: { type: ['string', 'null'] }
        },
        required: ['id', 'name', 'endpoint', 'region', 'bucket', 'credentialKey', 'lastSeen']
      }
    },
    credentials: {
      type: 'object',
      default: {}
    }
  }

  storeInstance = new Store<ConnectionsData>({
    name: 'easys3-connections',
    schema,
    clearInvalidConfig: true
  })

  return storeInstance
}

export function getAllConnections(): StoredConnection[] {
  return getConnectionsStore().get('connections')
}

export function getConnectionById(id: string): StoredConnection | undefined {
  return getAllConnections().find((c) => c.id === id)
}

export function addConnection(conn: StoredConnection, creds: CredentialPair): void {
  const store = getConnectionsStore()
  const connections = store.get('connections')
  connections.push(conn)
  store.set('connections', connections)
  const credentials = store.get('credentials')
  credentials[conn.credentialKey] = creds
  store.set('credentials', credentials)
}

export function updateConnection(
  id: string,
  patch: Partial<StoredConnection>,
  creds?: CredentialPair
): StoredConnection {
  const store = getConnectionsStore()
  const connections = store.get('connections')
  const idx = connections.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Connection not found: ${id}`)
  const updated = { ...connections[idx], ...patch }
  connections[idx] = updated
  store.set('connections', connections)
  if (creds) {
    const credentials = store.get('credentials')
    credentials[updated.credentialKey] = creds
    store.set('credentials', credentials)
  }
  return updated
}

export function deleteConnection(id: string): void {
  const store = getConnectionsStore()
  const connections = store.get('connections')
  const conn = connections.find((c) => c.id === id)
  if (!conn) throw new Error(`Connection not found: ${id}`)
  store.set(
    'connections',
    connections.filter((c) => c.id !== id)
  )
  const credentials = store.get('credentials')
  delete credentials[conn.credentialKey]
  store.set('credentials', credentials)
}

export function getCredentials(credentialKey: string): CredentialPair {
  const creds = getConnectionsStore().get('credentials')[credentialKey]
  if (!creds) throw new Error(`Credentials not found: ${credentialKey}`)
  return creds
}

export function setLastSeen(id: string, iso: string): void {
  const store = getConnectionsStore()
  const connections = store.get('connections')
  const idx = connections.findIndex((c) => c.id === id)
  if (idx === -1) return
  connections[idx] = { ...connections[idx], lastSeen: iso }
  store.set('connections', connections)
}

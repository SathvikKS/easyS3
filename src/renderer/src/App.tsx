import * as React from 'react'

import { AddConnectionDialog } from '@/components/add-connection-dialog'
import { SettingsDialog } from '@/components/settings-dialog'
import { FileViewer } from '@/components/file-viewer'
import { TabBar } from '@/components/tab-bar'
import { ThemeProvider } from '@/components/theme-provider'
import type {
  Bucket,
  Connection,
  ConnectionFormValues,
  ConnectionStatus,
  LayoutMode,
  S3File,
  Screen
} from '@/lib/types'
import { BucketsScreen } from '@/screens/buckets-screen'
import { ConnectionsScreen } from '@/screens/connections-screen'
import { ExplorerScreen } from '@/screens/explorer-screen'

function EasyS3App(): React.JSX.Element {
  const [connections, setConnections] = React.useState<Connection[]>([])
  const [screen, setScreen] = React.useState<Screen>('connections')
  const [openConns, setOpenConns] = React.useState<Connection[]>([])
  const [activeConn, setActiveConn] = React.useState<Connection | null>(null)
  const [activeBucket, setActiveBucket] = React.useState<Bucket | null>(null)
  const [layout, setLayout] = React.useState<LayoutMode>('list')
  const [selFiles, setSelFiles] = React.useState<Set<string>>(new Set())
  const [previewFile, setPreviewFile] = React.useState<S3File | null>(null)
  const [viewerFile, setViewerFile] = React.useState<S3File | null>(null)
  const [showAddConn, setShowAddConn] = React.useState(false)
  const [editConn, setEditConn] = React.useState<Connection | null>(null)
  const [showSettings, setShowSettings] = React.useState(false)
  const [connectingId, setConnectingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    window.api.connections.getAll().then((all) => {
      setConnections(all)
    })
  }, [])

  const resetExplorerState = (): void => {
    setSelFiles(new Set())
    setPreviewFile(null)
    setViewerFile(null)
  }

  const openConn = (conn: Connection): void => {
    setOpenConns((prev) => (prev.find((c) => c.name === conn.name) ? prev : [...prev, conn]))
    setActiveConn(conn)
    setActiveBucket(null)
    setScreen('buckets')
    resetExplorerState()
  }

  const switchTab = (conn: Connection): void => {
    setActiveConn(conn)
    setScreen(activeBucket && screen === 'explorer' ? 'explorer' : 'buckets')
  }

  const closeTab = (name: string): void => {
    const next = openConns.filter((c) => c.name !== name)
    setOpenConns(next)
    if (activeConn?.name === name) {
      if (next.length > 0) {
        setActiveConn(next[next.length - 1])
        setScreen('buckets')
      } else {
        setActiveConn(null)
        setActiveBucket(null)
        setScreen('connections')
      }
      resetExplorerState()
    }
  }

  const goHome = (): void => {
    setScreen('connections')
  }

  const browseBucket = (bucket: Bucket): void => {
    setActiveBucket(bucket)
    setScreen('explorer')
    resetExplorerState()
  }

  const disconnect = (): void => {
    if (!activeConn) return
    setOpenConns((prev) => prev.filter((c) => c.name !== activeConn.name))
    setActiveConn(null)
    setActiveBucket(null)
    setScreen('connections')
    resetExplorerState()
  }

  const handleCrumb = (idx: number): void => {
    if (idx === 0) {
      setScreen('buckets')
      setActiveBucket(null)
      resetExplorerState()
    } else if (idx === 1) {
      setScreen('explorer')
    }
  }

  const handleSaveNew = async (values: ConnectionFormValues): Promise<void> => {
    const newConn = await window.api.connections.add(values)
    setConnections((prev) => [...prev, newConn])
    const result = await window.api.connections.connect(newConn.id)
    if (result.success) {
      const connected: Connection = {
        ...newConn,
        buckets: result.buckets,
        lastSeen: result.lastSeen
      }
      setConnections((prev) => prev.map((c) => (c.id === connected.id ? connected : c)))
      openConn(connected)
    } else {
      openConn(newConn)
    }
  }

  const handleSaveEdit = async (values: ConnectionFormValues): Promise<void> => {
    if (!editConn) return
    const updated = await window.api.connections.update(editConn.id, values)
    setConnections((prev) => prev.map((c) => (c.id === editConn.id ? updated : c)))
    setOpenConns((prev) => prev.map((c) => (c.id === editConn.id ? updated : c)))
    if (activeConn?.id === editConn.id) setActiveConn(updated)
    setEditConn(null)
  }

  const handleDelete = async (conn: Connection): Promise<void> => {
    await window.api.connections.delete(conn.id)
    setConnections((prev) => prev.filter((c) => c.id !== conn.id))
    closeTab(conn.name)
  }

  const handleDuplicate = async (conn: Connection): Promise<void> => {
    const duped = await window.api.connections.duplicate(conn.id)
    setConnections((prev) => [...prev, duped])
  }

  const handleConnect = async (conn: Connection): Promise<void> => {
    setConnectingId(conn.id)
    try {
      const result = await window.api.connections.connect(conn.id)
      if (result.success) {
        const updated: Connection = {
          ...conn,
          buckets: result.buckets,
          lastSeen: result.lastSeen
        }
        setConnections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        setOpenConns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        openConn(updated)
      } else {
        console.error('Connect failed:', result.error)
      }
    } catch (err) {
      console.error('Connect error:', err)
    } finally {
      setConnectingId(null)
    }
  }

  const connectionsWithStatus = connections.map((c) => ({
    ...c,
    status: (openConns.some((o) => o.id === c.id) ? 'connected' : 'disconnected') as ConnectionStatus
  }))

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <TabBar
        openConns={openConns}
        activeConn={activeConn}
        onHome={goHome}
        onTab={switchTab}
        onNew={() => setShowAddConn(true)}
        onClose={closeTab}
        onOpenSettings={() => setShowSettings(true)}
      />

      {screen === 'connections' && (
        <ConnectionsScreen
          connections={connectionsWithStatus}
          connectingId={connectingId}
          onOpen={openConn}
          onConnect={handleConnect}
          onAdd={() => setShowAddConn(true)}
          onEdit={(c) => setEditConn(c)}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      )}

      {screen === 'buckets' && activeConn && (
        <BucketsScreen
          conn={activeConn}
          onBrowse={browseBucket}
          onDisconnect={disconnect}
          onEdit={(c) => setEditConn(c)}
        />
      )}

      {screen === 'explorer' && activeConn && activeBucket && (
        <ExplorerScreen
          conn={activeConn}
          bucket={activeBucket}
          layout={layout}
          onLayout={(mode) => {
            setLayout(mode)
            setViewerFile(null)
          }}
          selFiles={selFiles}
          setSelFiles={setSelFiles}
          previewFile={previewFile}
          setPreviewFile={setPreviewFile}
          setViewerFile={setViewerFile}
          onCrumb={handleCrumb}
        />
      )}

      {viewerFile && <FileViewer file={viewerFile} onClose={() => setViewerFile(null)} />}

      <AddConnectionDialog
        open={showAddConn}
        onOpenChange={setShowAddConn}
        onSave={handleSaveNew}
      />

      <AddConnectionDialog
        open={!!editConn}
        initialValues={editConn}
        onOpenChange={(open) => {
          if (!open) setEditConn(null)
        }}
        onSave={handleSaveEdit}
      />

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <EasyS3App />
    </ThemeProvider>
  )
}

export default App

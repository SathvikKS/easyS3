import * as React from 'react'

import { Toaster } from '@/components/ui/sonner'
import { AddConnectionDialog } from '@/components/add-connection-dialog'
import { SettingsDialog } from '@/components/settings-dialog'
import { FileViewer } from '@/components/file-viewer'
import { TabBar } from '@/components/tab-bar'
import { ThemeProvider } from '@/components/theme-provider'
import { getSettingsSync } from '@/lib/settings'
import type {
  Bucket,
  Connection,
  ConnectionFormValues,
  ConnectionStatus,
  LayoutMode,
  S3File,
  Screen,
  Tab,
  ViewerContext
} from '@/lib/types'
import { BucketsScreen } from '@/screens/buckets-screen'
import { ConnectionsScreen } from '@/screens/connections-screen'
import { ExplorerScreen } from '@/screens/explorer-screen'

function EasyS3App(): React.JSX.Element {
  const [connections, setConnections] = React.useState<Connection[]>([])
  const [tabs, setTabs] = React.useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null)
  const [layout, setLayout] = React.useState<LayoutMode>('list')
  const [selFiles, setSelFiles] = React.useState<Set<string>>(new Set())
  const [previewFile, setPreviewFile] = React.useState<S3File | null>(null)
  const [viewerFile, setViewerFile] = React.useState<ViewerContext | null>(null)
  const [showAddConn, setShowAddConn] = React.useState(false)
  const [editConn, setEditConn] = React.useState<Connection | null>(null)
  const [showSettings, setShowSettings] = React.useState(false)
  const [connectingId, setConnectingId] = React.useState<string | null>(null)
  const [fetchBucketStats, setFetchBucketStats] = React.useState(
    () => getSettingsSync().fetchBucketStats
  )

  const activeTab = tabs.find((t) => t.tabId === activeTabId) ?? null
  const activeConn = activeTab?.conn ?? null
  const activeBucket = activeTab?.activeBucket ?? null
  const screen: Screen = !activeTab ? 'connections' : activeTab.screen

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

  const fetchBucketsForTab = (tabId: string, connId: string): void => {
    setTabs((prev) =>
      prev.map((t) => t.tabId === tabId ? { ...t, bucketsLoading: true, bucketsError: null } : t)
    )
    window.api.buckets
      .list(connId)
      .then((list) => {
        setTabs((prev) =>
          prev.map((t) => t.tabId === tabId ? { ...t, buckets: list, bucketsLoading: false } : t)
        )
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load buckets'
        setTabs((prev) =>
          prev.map((t) =>
            t.tabId === tabId ? { ...t, bucketsError: msg, buckets: [], bucketsLoading: false } : t
          )
        )
      })
  }

  const openConn = (conn: Connection): void => {
    const tabId = crypto.randomUUID()
    const newTab: Tab = {
      tabId,
      conn,
      screen: 'buckets',
      activeBucket: null,
      buckets: [],
      bucketsLoading: true,
      bucketsError: null
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(tabId)
    resetExplorerState()
    fetchBucketsForTab(tabId, conn.id)
  }

  const switchTab = (tabId: string): void => {
    setActiveTabId(tabId)
    resetExplorerState()
  }

  const closeTab = (tabId: string): void => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.tabId !== tabId)
      if (activeTabId === tabId) {
        setActiveTabId(next.length > 0 ? next[next.length - 1].tabId : null)
        resetExplorerState()
      }
      return next
    })
  }

  const goHome = (): void => {
    setActiveTabId(null)
  }

  const browseBucket = (bucket: Bucket): void => {
    if (!activeTabId) return
    setTabs((prev) =>
      prev.map((t) =>
        t.tabId === activeTabId ? { ...t, activeBucket: bucket, screen: 'explorer' } : t
      )
    )
    resetExplorerState()
  }

  const disconnect = (): void => {
    if (!activeTabId) return
    closeTab(activeTabId)
  }

  const handleCrumb = (idx: number): void => {
    if (!activeTabId) return
    if (idx === 0) {
      setTabs((prev) =>
        prev.map((t) =>
          t.tabId === activeTabId ? { ...t, screen: 'buckets', activeBucket: null } : t
        )
      )
      resetExplorerState()
    } else if (idx === 1) {
      setTabs((prev) =>
        prev.map((t) => t.tabId === activeTabId ? { ...t, screen: 'explorer' } : t)
      )
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
    setTabs((prev) =>
      prev.map((t) => t.conn.id === editConn.id ? { ...t, conn: updated } : t)
    )
    setEditConn(null)
  }

  const handleDelete = async (conn: Connection): Promise<void> => {
    await window.api.connections.delete(conn.id)
    setConnections((prev) => prev.filter((c) => c.id !== conn.id))
    const next = tabs.filter((t) => t.conn.id !== conn.id)
    const activeWasDeleted = activeTabId !== null && !next.find((t) => t.tabId === activeTabId)
    setTabs(next)
    if (activeWasDeleted) {
      setActiveTabId(next.length > 0 ? next[next.length - 1].tabId : null)
      resetExplorerState()
    }
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
        setTabs((prev) => prev.map((t) => t.conn.id === updated.id ? { ...t, conn: updated } : t))
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

  const connectedIds = new Set(tabs.map((t) => t.conn.id))
  const connectionsWithStatus = connections.map((c) => ({
    ...c,
    status: (connectedIds.has(c.id) ? 'connected' : 'disconnected') as ConnectionStatus
  }))

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
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

      {screen === 'buckets' && activeConn && activeTab && (
        <BucketsScreen
          conn={activeConn}
          buckets={activeTab.buckets}
          loading={activeTab.bucketsLoading}
          error={activeTab.bucketsError}
          fetchBucketStats={fetchBucketStats}
          onBrowse={browseBucket}
          onDisconnect={disconnect}
          onEdit={(c) => setEditConn(c)}
          onRefresh={() => fetchBucketsForTab(activeTab.tabId, activeConn.id)}
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

      {viewerFile && <FileViewer {...viewerFile} onClose={() => setViewerFile(null)} />}

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

      <SettingsDialog
        open={showSettings}
        onOpenChange={(open) => {
          setShowSettings(open)
          if (!open) setFetchBucketStats(getSettingsSync().fetchBucketStats)
        }}
      />
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <EasyS3App />
      <Toaster />
    </ThemeProvider>
  )
}

export default App

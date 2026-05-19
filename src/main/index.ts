import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  type AppSettings,
  getAllSettings,
  getSetting,
  getStore,
  setSetting
} from './store'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function resolveBrowseDefaultPath(candidate: string | undefined): Promise<string> {
  if (candidate) {
    try {
      const stat = await fs.stat(candidate)
      if (stat.isDirectory()) return candidate
    } catch {
      // candidate does not exist or is not accessible — fall through to home
    }
  }
  return app.getPath('home')
}

function registerSettingsIpc(): void {
  // Eagerly construct the store so schema defaults are written to disk on first run.
  getStore()

  // Sync bootstrap so the renderer can read initial settings before first paint
  // (avoids a flash of unstyled / wrong-theme content).
  ipcMain.on('settings:getAllSync', (event) => {
    event.returnValue = getAllSettings()
  })

  ipcMain.handle('settings:getAll', () => getAllSettings())

  ipcMain.handle('settings:get', (_event, key: keyof AppSettings) => getSetting(key))

  ipcMain.handle(
    'settings:set',
    <K extends keyof AppSettings>(_event: unknown, key: K, value: AppSettings[K]) => {
      setSetting(key, value)
      return getSetting(key)
    }
  )

  ipcMain.handle('settings:selectDownloadDirectory', async (event, currentPath?: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const defaultPath = await resolveBrowseDefaultPath(currentPath)
    const options = {
      defaultPath,
      properties: ['openDirectory', 'createDirectory'] as ['openDirectory', 'createDirectory']
    }
    const result = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  registerSettingsIpc()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

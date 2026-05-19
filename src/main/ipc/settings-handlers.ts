import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { promises as fs } from 'fs'

import { IPC } from '../../shared/ipc'
import {
  assertTrustedSender,
  parseOptionalPath,
  parseSettingKey,
  parseSettingValue
} from '../ipc-guards'
import { getAllSettings, getSetting, getStore, setSetting } from '../store'

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

export function registerSettingsIpcHandlers(): void {
  // Eagerly construct the store so schema defaults are written to disk on first run.
  getStore()

  // Sync bootstrap so the renderer can read initial settings before first paint
  // (avoids a flash of unstyled / wrong-theme content).
  ipcMain.on(IPC.settings.getAllSync, (event) => {
    assertTrustedSender(event)
    event.returnValue = getAllSettings()
  })

  ipcMain.handle(IPC.settings.getAll, (event) => {
    assertTrustedSender(event)
    return getAllSettings()
  })

  ipcMain.handle(IPC.settings.get, (event, key: unknown) => {
    assertTrustedSender(event)
    return getSetting(parseSettingKey(key))
  })

  ipcMain.handle(IPC.settings.set, (event, key: unknown, value: unknown) => {
    assertTrustedSender(event)
    const settingKey = parseSettingKey(key)
    const settingValue = parseSettingValue(settingKey, value)
    setSetting(settingKey, settingValue)
    return getSetting(settingKey)
  })

  ipcMain.handle(IPC.settings.selectDownloadDirectory, async (event, currentPath?: unknown) => {
    assertTrustedSender(event)
    const path = parseOptionalPath(currentPath)
    const win = BrowserWindow.fromWebContents(event.sender)
    const defaultPath = await resolveBrowseDefaultPath(path)
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

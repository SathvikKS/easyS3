import { contextBridge, ipcRenderer } from 'electron'

import { IPC } from '../shared/ipc'
import type { AppSettings } from '../shared/settings'
import { isAppSettingKey, isValidSettingValue } from '../shared/settings-validation'

/**
 * Narrow IPC surface: only whitelisted channels and validated arguments cross the bridge.
 * Never expose ipcRenderer, Node, or process to the renderer.
 */
const settings = {
  getAllSync: (): AppSettings =>
    ipcRenderer.sendSync(IPC.settings.getAllSync) as AppSettings,

  getAll: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.settings.getAll),

  get: <K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> => {
    if (!isAppSettingKey(key)) {
      return Promise.reject(new Error('Invalid settings key'))
    }
    return ipcRenderer.invoke(IPC.settings.get, key)
  },

  set: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<AppSettings[K]> => {
    if (!isAppSettingKey(key) || !isValidSettingValue(key, value)) {
      return Promise.reject(new Error('Invalid settings key or value'))
    }
    return ipcRenderer.invoke(IPC.settings.set, key, value)
  },

  selectDownloadDirectory: (currentPath?: string): Promise<string | null> => {
    if (currentPath !== undefined && typeof currentPath !== 'string') {
      return Promise.reject(new Error('Invalid download directory path'))
    }
    return ipcRenderer.invoke(IPC.settings.selectDownloadDirectory, currentPath)
  }
}

const api = { settings }

if (!process.contextIsolated) {
  throw new Error(
    'contextIsolation must be enabled. Refusing to expose APIs on an insecure renderer.'
  )
}

contextBridge.exposeInMainWorld('api', api)

export type EasyS3Settings = typeof settings
export type EasyS3Api = typeof api

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import type { AppSettings } from '../shared/settings'

const settings = {
  getAllSync: (): AppSettings => ipcRenderer.sendSync('settings:getAllSync') as AppSettings,
  getAll: (): Promise<AppSettings> => ipcRenderer.invoke('settings:getAll'),
  get: <K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> =>
    ipcRenderer.invoke('settings:get', key),
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<AppSettings[K]> =>
    ipcRenderer.invoke('settings:set', key, value),
  selectDownloadDirectory: (currentPath?: string): Promise<string | null> =>
    ipcRenderer.invoke('settings:selectDownloadDirectory', currentPath)
}

const api = {
  settings
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

export type EasyS3Settings = typeof settings
export type EasyS3Api = typeof api

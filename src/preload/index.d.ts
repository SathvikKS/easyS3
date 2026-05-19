import type { AppSettings, ThemeMode } from '../shared/settings'

export type { AppSettings, ThemeMode }

export interface EasyS3Settings {
  getAllSync: () => AppSettings
  getAll: () => Promise<AppSettings>
  get: <K extends keyof AppSettings>(key: K) => Promise<AppSettings[K]>
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<AppSettings[K]>
  selectDownloadDirectory: (currentPath?: string) => Promise<string | null>
}

export interface EasyS3Api {
  settings: EasyS3Settings
}

declare global {
  interface Window {
    api: EasyS3Api
  }
}

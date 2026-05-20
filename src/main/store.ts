import { app } from 'electron'
import Store, { type Schema } from 'electron-store'

import type { AppSettings } from '../shared/settings'

export type { AppSettings, ThemeMode } from '../shared/settings'

let storeInstance: Store<AppSettings> | null = null

/**
 * Lazy accessor. `app.getPath('downloads')` requires the app to be ready,
 * so the store is initialized on first use after `app.whenReady()`.
 */
export function getStore(): Store<AppSettings> {
  if (storeInstance) return storeInstance

  const schema: Schema<AppSettings> = {
    theme: {
      type: 'string',
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    downloadPath: {
      type: 'string',
      minLength: 1,
      default: app.getPath('downloads')
    },
    promptBeforeDownload: {
      type: 'boolean',
      default: false
    },
    fetchBucketStats: {
      type: 'boolean',
      default: true
    }
  }

  storeInstance = new Store<AppSettings>({
    name: 'easys3-config',
    schema,
    clearInvalidConfig: true
  })

  return storeInstance
}

export function getAllSettings(): AppSettings {
  return getStore().store
}

export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return getStore().get(key)
}

export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  getStore().set(key, value)
}

import type { IpcMainEvent, IpcMainInvokeEvent, WebContents } from 'electron'
import { BrowserWindow } from 'electron'

import type { AppSettings } from '../shared/settings'
import { isAppSettingKey, isValidSettingValue } from '../shared/settings-validation'

/** Reject IPC from webContents that are not attached to an app-owned window. */
export function assertTrustedSender(event: IpcMainEvent | IpcMainInvokeEvent): void {
  if (!isTrustedWebContents(event.sender)) {
    throw new Error('IPC rejected: untrusted sender')
  }
}

export function isTrustedWebContents(webContents: WebContents): boolean {
  if (webContents.isDestroyed()) return false
  const win = BrowserWindow.fromWebContents(webContents)
  return win !== null && !win.isDestroyed()
}

export function parseSettingKey(key: unknown): keyof AppSettings {
  if (!isAppSettingKey(key)) {
    throw new Error('Invalid settings key')
  }
  return key
}

export function parseSettingValue<K extends keyof AppSettings>(
  key: K,
  value: unknown
): AppSettings[K] {
  if (!isValidSettingValue(key, value)) {
    throw new Error('Invalid settings value')
  }
  return value
}

export function parseOptionalPath(path: unknown): string | undefined {
  if (path === undefined) return undefined
  if (typeof path !== 'string') {
    throw new Error('Invalid path')
  }
  return path
}

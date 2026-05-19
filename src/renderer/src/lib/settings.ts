import type { AppSettings, ThemeMode } from '../../../shared/settings'

export type { AppSettings, ThemeMode }

export function getSettingsSync(): AppSettings {
  return window.api.settings.getAllSync()
}

export function getSettings(): Promise<AppSettings> {
  return window.api.settings.getAll()
}

export async function setTheme(theme: ThemeMode): Promise<void> {
  await window.api.settings.set('theme', theme)
}

export async function setDownloadPath(path: string): Promise<void> {
  await window.api.settings.set('downloadPath', path)
}

export async function setDownloadPrompt(prompt: boolean): Promise<void> {
  await window.api.settings.set('promptBeforeDownload', prompt)
}

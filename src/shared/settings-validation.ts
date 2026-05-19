import type { AppSettings, ThemeMode } from './settings'

export const APP_SETTING_KEYS = [
  'theme',
  'downloadPath',
  'promptBeforeDownload'
] as const satisfies ReadonlyArray<keyof AppSettings>

export function isAppSettingKey(key: unknown): key is keyof AppSettings {
  return typeof key === 'string' && (APP_SETTING_KEYS as readonly string[]).includes(key)
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function isValidSettingValue<K extends keyof AppSettings>(
  key: K,
  value: unknown
): value is AppSettings[K] {
  switch (key) {
    case 'theme':
      return isThemeMode(value)
    case 'downloadPath':
      return typeof value === 'string' && value.trim().length > 0
    case 'promptBeforeDownload':
      return typeof value === 'boolean'
    default:
      return false
  }
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type AppSettings = {
  theme: ThemeMode
  downloadPath: string
  promptBeforeDownload: boolean
}

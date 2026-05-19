import { ElectronAPI } from '@electron-toolkit/preload'

export interface EasyS3Api {
  selectDownloadDirectory: () => Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: EasyS3Api
  }
}

import { registerBucketIpcHandlers } from './bucket-handlers'
import { registerConnectionIpcHandlers } from './connection-handlers'
import { registerFilesIpcHandlers } from './files-handlers'
import { registerSettingsIpcHandlers } from './settings-handlers'

/** Register all main-process IPC handlers. Call once from `app.whenReady()`. */
export function registerIpcHandlers(): void {
  registerSettingsIpcHandlers()
  registerConnectionIpcHandlers()
  registerBucketIpcHandlers()
  registerFilesIpcHandlers()
}

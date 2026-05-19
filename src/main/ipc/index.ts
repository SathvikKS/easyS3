import { registerSettingsIpcHandlers } from './settings-handlers'

/** Register all main-process IPC handlers. Call once from `app.whenReady()`. */
export function registerIpcHandlers(): void {
  registerSettingsIpcHandlers()
}

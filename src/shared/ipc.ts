/** IPC channel names — keep in sync between preload and main. */
export const IPC = {
  settings: {
    getAllSync: 'settings:getAllSync',
    getAll: 'settings:getAll',
    get: 'settings:get',
    set: 'settings:set',
    selectDownloadDirectory: 'settings:selectDownloadDirectory'
  }
} as const

/** IPC channel names — keep in sync between preload and main. */
export const IPC = {
  settings: {
    getAllSync: 'settings:getAllSync',
    getAll: 'settings:getAll',
    get: 'settings:get',
    set: 'settings:set',
    selectDownloadDirectory: 'settings:selectDownloadDirectory'
  },
  connections: {
    getAll: 'connections:getAll',
    add: 'connections:add',
    update: 'connections:update',
    delete: 'connections:delete',
    duplicate: 'connections:duplicate',
    connect: 'connections:connect',
    testConnect: 'connections:testConnect'
  },
  buckets: {
    list: 'buckets:list'
  },
  files: {
    list: 'files:list',
    download: 'files:download',
    delete: 'files:delete',
    getPresignedUrl: 'files:getPresignedUrl',
    getS3Url: 'files:getS3Url',
    getPreview: 'files:getPreview'
  }
} as const

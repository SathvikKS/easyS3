import { promises as fs } from 'fs'
import path from 'path'

import { app, BrowserWindow, dialog, ipcMain } from 'electron'

import { IPC } from '../../shared/ipc'
import { decryptCredential } from '../credentials'
import { getConnectionById, getCredentials } from '../connections-store'
import { assertTrustedSender } from '../ipc-guards'
import {
  createFolder,
  createS3Client,
  deleteObject,
  deleteObjects,
  downloadFile,
  getFilePreview,
  getPresignedUrl,
  listAllObjects,
  listFiles,
  uploadFile
} from '../s3-client'
import { getAllSettings } from '../store'

type ListFilesArgs = {
  connId: string
  bucket: string
  prefix: string
  continuationToken?: string
  maxKeys?: number
}

function parseListFilesArgs(args: unknown): ListFilesArgs {
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments: expected an object')
  }
  const a = args as Record<string, unknown>

  if (typeof a.connId !== 'string' || !a.connId) {
    throw new Error('Invalid arguments: connId must be a non-empty string')
  }
  if (typeof a.bucket !== 'string' || !a.bucket) {
    throw new Error('Invalid arguments: bucket must be a non-empty string')
  }
  if (typeof a.prefix !== 'string') {
    throw new Error('Invalid arguments: prefix must be a string')
  }
  if (a.continuationToken !== undefined && typeof a.continuationToken !== 'string') {
    throw new Error('Invalid arguments: continuationToken must be a string if provided')
  }
  if (a.maxKeys !== undefined) {
    if (typeof a.maxKeys !== 'number' || a.maxKeys <= 0) {
      throw new Error('Invalid arguments: maxKeys must be a positive number if provided')
    }
  }

  return {
    connId: a.connId,
    bucket: a.bucket,
    prefix: a.prefix,
    continuationToken: a.continuationToken as string | undefined,
    maxKeys: a.maxKeys !== undefined ? Math.min(a.maxKeys as number, 1000) : undefined
  }
}

type FileOpArgs = {
  connId: string
  bucket: string
  key: string
}

function parseFileOpArgs(args: unknown): FileOpArgs {
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments: expected an object')
  }
  const a = args as Record<string, unknown>
  if (typeof a.connId !== 'string' || !a.connId) {
    throw new Error('Invalid arguments: connId must be a non-empty string')
  }
  if (typeof a.bucket !== 'string' || !a.bucket) {
    throw new Error('Invalid arguments: bucket must be a non-empty string')
  }
  if (typeof a.key !== 'string' || !a.key) {
    throw new Error('Invalid arguments: key must be a non-empty string')
  }
  return { connId: a.connId, bucket: a.bucket, key: a.key }
}

type DownloadItem = {
  key: string
  name: string
}

type DownloadJobArgs = {
  connId: string
  bucket: string
  files: DownloadItem[]
}

function parseDownloadJobArgs(args: unknown): DownloadJobArgs {
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments: expected an object')
  }
  const a = args as Record<string, unknown>
  if (typeof a.connId !== 'string' || !a.connId) {
    throw new Error('Invalid arguments: connId must be a non-empty string')
  }
  if (typeof a.bucket !== 'string' || !a.bucket) {
    throw new Error('Invalid arguments: bucket must be a non-empty string')
  }
  if (!Array.isArray(a.files) || a.files.length === 0) {
    throw new Error('Invalid arguments: files must be a non-empty array')
  }
  for (const item of a.files as unknown[]) {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof (item as Record<string, unknown>).key !== 'string' ||
      !(item as Record<string, unknown>).key ||
      typeof (item as Record<string, unknown>).name !== 'string' ||
      !(item as Record<string, unknown>).name
    ) {
      throw new Error('Invalid arguments: each file must have a non-empty key and name')
    }
  }
  return {
    connId: a.connId,
    bucket: a.bucket,
    files: a.files as DownloadItem[]
  }
}

function getClientForConn(connId: string): ReturnType<typeof createS3Client> {
  const conn = getConnectionById(connId)
  if (!conn) throw new Error(`Connection not found: ${connId}`)
  const rawCreds = getCredentials(conn.credentialKey)
  return createS3Client(
    conn.endpoint,
    conn.region,
    decryptCredential(rawCreds.key),
    decryptCredential(rawCreds.secret)
  )
}

type DeleteArgs = { connId: string; bucket: string; keys: string[] }

function parseDeleteArgs(args: unknown): DeleteArgs {
  if (!args || typeof args !== 'object') throw new Error('Invalid arguments: expected an object')
  const a = args as Record<string, unknown>
  if (typeof a.connId !== 'string' || !a.connId) throw new Error('Invalid arguments: connId must be a non-empty string')
  if (typeof a.bucket !== 'string' || !a.bucket) throw new Error('Invalid arguments: bucket must be a non-empty string')
  if (!Array.isArray(a.keys) || a.keys.length === 0) throw new Error('Invalid arguments: keys must be a non-empty array')
  for (const k of a.keys as unknown[]) {
    if (typeof k !== 'string' || !k) throw new Error('Invalid arguments: each key must be a non-empty string')
  }
  return { connId: a.connId, bucket: a.bucket, keys: a.keys as string[] }
}

type UploadArgs = { connId: string; bucket: string; destPrefix: string }

function parseUploadArgs(args: unknown): UploadArgs {
  if (!args || typeof args !== 'object') throw new Error('Invalid arguments: expected an object')
  const a = args as Record<string, unknown>
  if (typeof a.connId !== 'string' || !a.connId) throw new Error('Invalid arguments: connId must be a non-empty string')
  if (typeof a.bucket !== 'string' || !a.bucket) throw new Error('Invalid arguments: bucket must be a non-empty string')
  if (typeof a.destPrefix !== 'string') throw new Error('Invalid arguments: destPrefix must be a string')
  return { connId: a.connId, bucket: a.bucket, destPrefix: a.destPrefix }
}

type CreateFolderArgs = { connId: string; bucket: string; key: string }

function parseCreateFolderArgs(args: unknown): CreateFolderArgs {
  if (!args || typeof args !== 'object') throw new Error('Invalid arguments: expected an object')
  const a = args as Record<string, unknown>
  if (typeof a.connId !== 'string' || !a.connId) throw new Error('Invalid arguments: connId must be a non-empty string')
  if (typeof a.bucket !== 'string' || !a.bucket) throw new Error('Invalid arguments: bucket must be a non-empty string')
  if (typeof a.key !== 'string' || !a.key) throw new Error('Invalid arguments: key must be a non-empty string')
  return { connId: a.connId, bucket: a.bucket, key: a.key }
}

async function walkDir(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath)))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

export function registerFilesIpcHandlers(): void {
  ipcMain.handle(IPC.files.list, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, prefix, continuationToken, maxKeys } = parseListFilesArgs(args)

    const conn = getConnectionById(connId)
    if (!conn) throw new Error(`Connection not found: ${connId}`)

    const rawCreds = getCredentials(conn.credentialKey)
    const client = createS3Client(
      conn.endpoint,
      conn.region,
      decryptCredential(rawCreds.key),
      decryptCredential(rawCreds.secret)
    )

    return listFiles(client, bucket, prefix, continuationToken, maxKeys)
  })

  ipcMain.handle(IPC.files.download, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, files } = parseDownloadJobArgs(args)
    try {
      const { promptBeforeDownload, downloadPath } = getAllSettings()
      let destFolder: string
      if (promptBeforeDownload) {
        const win = BrowserWindow.fromWebContents(event.sender)
        const result = win
          ? await dialog.showOpenDialog(win, {
              properties: ['openDirectory', 'createDirectory']
            })
          : await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
        if (result.canceled) {
          return { success: false, cancelled: true }
        }
        destFolder = result.filePaths[0]
      } else {
        destFolder = downloadPath || app.getPath('downloads')
      }
      await fs.mkdir(destFolder, { recursive: true })
      const client = getClientForConn(connId)
      for (const item of files) {
        await downloadFile(client, bucket, item.key, path.join(destFolder, item.name))
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(IPC.files.delete, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, keys } = parseDeleteArgs(args)
    try {
      const client = getClientForConn(connId)
      const allKeys: string[] = []
      for (const key of keys) {
        if (key.endsWith('/')) {
          const folderKeys = await listAllObjects(client, bucket, key)
          allKeys.push(...folderKeys)
        } else {
          allKeys.push(key)
        }
      }
      if (allKeys.length === 0) {
        for (const key of keys) {
          await deleteObject(client, bucket, key)
        }
        return { success: true, deleted: keys.length }
      }
      for (let i = 0; i < allKeys.length; i += 1000) {
        await deleteObjects(client, bucket, allKeys.slice(i, i + 1000))
      }
      return { success: true, deleted: allKeys.length }
    } catch (err) {
      return { success: false, deleted: 0, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(IPC.files.upload, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, destPrefix } = parseUploadArgs(args)
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = win
        ? await dialog.showOpenDialog(win, { properties: ['openFile', 'multiSelections'] })
        : await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
      if (result.canceled) return { success: false, cancelled: true, uploaded: 0 }
      const client = getClientForConn(connId)
      for (const localPath of result.filePaths) {
        const fileName = path.basename(localPath)
        await uploadFile(client, bucket, destPrefix + fileName, localPath)
      }
      return { success: true, uploaded: result.filePaths.length }
    } catch (err) {
      return { success: false, uploaded: 0, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(IPC.files.uploadFolder, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, destPrefix } = parseUploadArgs(args)
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = win
        ? await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
        : await dialog.showOpenDialog({ properties: ['openDirectory'] })
      if (result.canceled) return { success: false, cancelled: true, uploaded: 0 }
      const localFolderPath = result.filePaths[0]
      const folderName = path.basename(localFolderPath)
      const client = getClientForConn(connId)
      const allLocalFiles = await walkDir(localFolderPath)
      for (const localPath of allLocalFiles) {
        const relative = path.relative(localFolderPath, localPath).split(path.sep).join('/')
        await uploadFile(client, bucket, destPrefix + folderName + '/' + relative, localPath)
      }
      return { success: true, uploaded: allLocalFiles.length }
    } catch (err) {
      return { success: false, uploaded: 0, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(IPC.files.createFolder, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, key } = parseCreateFolderArgs(args)
    try {
      const client = getClientForConn(connId)
      await createFolder(client, bucket, key)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(IPC.files.getPresignedUrl, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, key } = parseFileOpArgs(args)
    const a = args as Record<string, unknown>
    if (a.expiresIn !== undefined && (typeof a.expiresIn !== 'number' || a.expiresIn <= 0)) {
      throw new Error('Invalid arguments: expiresIn must be a positive number if provided')
    }
    const expiresIn = typeof a.expiresIn === 'number' ? a.expiresIn : undefined
    const client = getClientForConn(connId)
    const url = await getPresignedUrl(client, bucket, key, expiresIn)
    return { url }
  })

  ipcMain.handle(IPC.files.getS3Url, (event, args: unknown) => {
    assertTrustedSender(event)
    const { bucket, key } = parseFileOpArgs(args)
    return { url: `s3://${bucket}/${key}` }
  })

  ipcMain.handle(IPC.files.getPreview, async (event, args: unknown) => {
    assertTrustedSender(event)
    const { connId, bucket, key } = parseFileOpArgs(args)
    const a = args as Record<string, unknown>
    if (typeof a.fileType !== 'string') {
      throw new Error('Invalid arguments: fileType must be a string')
    }
    const client = getClientForConn(connId)
    return getFilePreview(client, bucket, key, a.fileType)
  })
}

import { safeStorage } from 'electron'

export function encryptCredential(plain: string): string {
  return safeStorage.encryptString(plain).toString('base64')
}

export function decryptCredential(encrypted: string): string {
  return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
}

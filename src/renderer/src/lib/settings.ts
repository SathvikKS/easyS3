const DOWNLOAD_PATH_KEY = 'easys3-download-path'
const DOWNLOAD_PROMPT_KEY = 'easys3-download-prompt'

export const DEFAULT_DOWNLOAD_PATH = '~/Downloads'

export function getDownloadPath(): string {
  return localStorage.getItem(DOWNLOAD_PATH_KEY) ?? DEFAULT_DOWNLOAD_PATH
}

export function setDownloadPath(path: string): void {
  localStorage.setItem(DOWNLOAD_PATH_KEY, path)
}

export function getDownloadPrompt(): boolean {
  return localStorage.getItem(DOWNLOAD_PROMPT_KEY) === 'true'
}

export function setDownloadPrompt(prompt: boolean): void {
  localStorage.setItem(DOWNLOAD_PROMPT_KEY, prompt ? 'true' : 'false')
}

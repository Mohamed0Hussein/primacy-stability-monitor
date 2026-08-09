/// <reference types="vite/client" />

interface UpdateInfo {
  version: string
}

interface ElectronAPI {
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void
  onUpdateError: (callback: (message: string) => void) => () => void
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
}

interface Window {
  electronAPI?: ElectronAPI
}

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('rayndom', {
  focusMainWindow: async () => ipcRenderer.invoke('app:focus-main-window'),
})

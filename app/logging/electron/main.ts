import { app, BrowserWindow } from 'electron'
import path from 'path'
import { createAppWindow, getFreePort, setupFocusHandler, startNextServer } from '../../../electron/lib'

let mainWindow: BrowserWindow | null = null

const projectRoot = path.resolve(__dirname, '../../../..')

const createWindow = async () => {
  const port = await getFreePort()
  const { origin, childProcesses } = await startNextServer({ port, projectRoot, healthCheckPath: '/logging' })

  const win = await createAppWindow({
    origin,
    route: '/logging',
    width: 1200,
    height: 900,
    preloadPath: path.resolve(__dirname, '../../../electron/preload.js'),
    iconPath: path.resolve(projectRoot, 'build/icon.png'),
    onClosed: () => {
      for (const child of childProcesses) child.kill()
      mainWindow = null
    },
  })
  mainWindow = win
}

app.whenReady().then(async () => {
  setupFocusHandler({ getMainWindow: () => mainWindow })
  await createWindow()
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

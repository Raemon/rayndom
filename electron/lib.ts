import { app, BrowserWindow, shell, ipcMain } from 'electron'
import path from 'path'
import { spawn, type ChildProcess } from 'child_process'
import net from 'net'
import http from 'http'

const isDev = !app.isPackaged

export const getFreePort = () => new Promise<number>((resolve, reject) => {
  const server = net.createServer()
  server.on('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    server.close(() => {
      if (!address || typeof address === 'string') return reject(new Error('Failed to allocate port'))
      resolve(address.port)
    })
  })
})

export const httpOk = (url: string) => new Promise<boolean>((resolve) => {
  const req = http.get(url, res => {
    res.resume()
    resolve((res.statusCode || 0) >= 200 && (res.statusCode || 0) < 500)
  })
  req.on('error', () => resolve(false))
  req.setTimeout(2000, () => { req.destroy(); resolve(false) })
})

export const waitForHttp = async (url: string, timeoutMs: number) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const ok = await httpOk(url)
    if (ok) return
    await new Promise(r => setTimeout(r, 200))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

export const startNextServer = async ({ port, projectRoot, healthCheckPath, extraEnv }:{ port: number, projectRoot: string, healthCheckPath: string, extraEnv?: Record<string, string> }) => {
  const nodeEnv: NodeJS.ProcessEnv = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    PORT: String(port),
    HOSTNAME: '127.0.0.1',
    ...(app.isPackaged ? { NODE_ENV: 'production', ...(extraEnv || {}) } : { ...(extraEnv || {}) }),
  }

  const childProcesses: ChildProcess[] = []

  if (isDev) {
    const nextCliPath = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
    const nextDev = spawn(process.execPath, [nextCliPath, 'dev', '-p', String(port), '-H', '127.0.0.1'], { env: nodeEnv, cwd: projectRoot, stdio: 'inherit' })
    childProcesses.push(nextDev)
    await waitForHttp(`http://127.0.0.1:${port}${healthCheckPath}`, 120000)
    return { origin: `http://127.0.0.1:${port}`, childProcesses }
  }

  const nextRoot = path.join(process.resourcesPath, 'next')
  const serverJsPath = path.join(nextRoot, 'server.js')
  const nextProd = spawn(process.execPath, [serverJsPath], { env: nodeEnv, cwd: nextRoot, stdio: 'inherit' })
  childProcesses.push(nextProd)
  await waitForHttp(`http://127.0.0.1:${port}${healthCheckPath}`, 120000)
  return { origin: `http://127.0.0.1:${port}`, childProcesses }
}

export const createAppWindow = async ({ origin, route, width, height, preloadPath, onClosed }:{ origin: string, route: string, width: number, height: number, preloadPath: string, onClosed?: () => void }) => {
  const win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
  })

  const allowedOrigin = origin

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(allowedOrigin)) return { action: 'allow' }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith(allowedOrigin)) return
    e.preventDefault()
    shell.openExternal(url)
  })

  win.on('closed', () => {
    if (onClosed) onClosed()
  })

  await win.loadURL(`${origin}${route}`)
  return win
}

export const setupFocusHandler = ({ getMainWindow }:{ getMainWindow: () => BrowserWindow | null }) => {
  ipcMain.handle('app:focus-main-window', async () => {
    const win = getMainWindow() || BrowserWindow.getAllWindows()[0]
    if (!win) return
    try {
      if (win.isMinimized()) win.restore()
      win.show()
      if (typeof app.focus === 'function') {
        try { app.focus({ steal: true }) } catch { app.focus() }
      }
      win.focus()
      win.setAlwaysOnTop(true)
      setTimeout(() => win && !win.isDestroyed() && win.setAlwaysOnTop(false), 100)
    } catch (e) {
      console.warn('[electron] Failed to focus window:', e)
    }
  })
}
